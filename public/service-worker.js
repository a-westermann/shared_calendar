self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/static/images/icon.png',
            badge: '/static/images/badge.png',
            data: data.data || {},
            actions: [
                {
                    action: 'open',
                    title: 'Open Calendar'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'open') {
        // Open the calendar page
        event.waitUntil(
            clients.openWindow('/calendar/')
        );
    } else if (event.notification.data && event.notification.data.url) {
        // Open a specific URL if provided in the notification data
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
}); 