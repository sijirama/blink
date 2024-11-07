import { messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';
import { useState } from 'react';
import { Button } from '../ui/button';

//const VapidKey = import.meta.env.VITE_VAPID_KEY


const FCMTokenManager = () => {
    const [_deviceToken, setDeviceToken] = useState('');

    const registerDeviceToken = async () => {
        try {
            const vapidKey = import.meta.env.VITE_VAPID_KEY;

            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const currentToken = await getToken(messaging, { vapidKey });
                if (currentToken) {
                    console.log(currentToken)
                    setDeviceToken(currentToken);
                    await sendTokenToBackend(currentToken);
                } else {
                    console.log('No registration token available. Request permission to generate one.');
                }
            } else {
                console.log('Unable to get permission to notify.', permission);
            }
        } catch (err) {
            console.log('An error occurred while retrieving token:', err);
        }
    };

    const sendTokenToBackend = async (token: string) => {
        try {
            const response = await fetch('/api/user/deviceId', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    platform: 'web',
                    browser: navigator.userAgent,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            console.log('Device token registered successfully');
        } catch (error) {
            console.error('Error registering device token:', error);
        }
    };

    return (
        <Button onClick={registerDeviceToken}>
            Register for Push Notifications
        </Button>
    );
};

export default FCMTokenManager;
