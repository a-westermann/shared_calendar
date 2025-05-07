// Check if browser supports notifications
const isNotificationSupported = () => {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

// Request notification permission
const requestNotificationPermission = async () => {
    if (!isNotificationSupported()) {
        console.log('Notifications not supported');
        return false;
    }

    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

// Register service worker
const registerServiceWorker = async () => {
    if (!isNotificationSupported()) {
        console.log('Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', registration);
        return registration;
    } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
    }
};

// Subscribe to push notifications
const subscribeToPushNotifications = async () => {
    if (!isNotificationSupported()) {
        console.log('Push notifications not supported');
        return null;
    }

    try {
        const registration = await registerServiceWorker();
        if (!registration) {
            return null;
        }

        const permission = await requestNotificationPermission();
        if (!permission) {
            return null;
        }

        // Get the subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.VAPID_PUBLIC_KEY // This will be provided by your server
        });

        console.log('Push subscription successful:', subscription);
        return subscription;
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return null;
    }
};

// Send subscription to server
const sendSubscriptionToServer = async (subscription) => {
    try {
        const response = await fetch('/api/notifications/subscribe/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription),
        });

        if (!response.ok) {
            throw new Error('Failed to send subscription to server');
        }

        console.log('Subscription sent to server successfully');
        return true;
    } catch (error) {
        console.error('Error sending subscription to server:', error);
        return false;
    }
};

// Initialize notifications
const initializeNotifications = async () => {
    if (!isNotificationSupported()) {
        return false;
    }

    const subscription = await subscribeToPushNotifications();
    if (subscription) {
        return await sendSubscriptionToServer(subscription);
    }

    return false;
};

export {
    isNotificationSupported,
    requestNotificationPermission,
    registerServiceWorker,
    subscribeToPushNotifications,
    sendSubscriptionToServer,
    initializeNotifications
}; 