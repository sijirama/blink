export const registerServiceWorker = async () => {
    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
            });

            // Wait for the service worker to be ready
            await navigator.serviceWorker.ready;
            return registration;
        }
        throw new Error('Service Worker not supported');
    } catch (err) {
        throw new Error(`Service Worker registration failed: ${err}`);
    }
};

