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

        // Get the VAPID public key from the window object
        const publicKey = window.VAPID_PUBLIC_KEY;
        if (!publicKey) {
            console.error('VAPID public key not found');
            return null;
        }

        // Convert the public key to Uint8Array
        const applicationServerKey = urlBase64ToUint8Array(publicKey);

        // Get the subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey
        });

        console.log('Push subscription successful:', subscription);
        return subscription;
    } catch (error) {
        console.error('Error subscribing to push notifications:', error);
        return null;
    }
};

// Helper function to convert base64 string to Uint8Array
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

// Send subscription to server
const sendSubscriptionToServer = async (subscription) => {
    try {
        const response = await fetch('/calendar/api/notifications/subscribe/', {
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