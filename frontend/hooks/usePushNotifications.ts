import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function usePushNotifications() {
  const { data: session } = useSession();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported || !session) return;

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToPush();
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const subscribeToPush = async () => {
    if (!isSupported || !session) return;

    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');

      // Get VAPID public key from server
      const vapidResponse = await fetch('/api/notifications/vapid');
      const { publicKey } = await vapidResponse.json();

      // Subscribe to push
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: pushSubscription }),
      });

      setSubscription(pushSubscription);
      console.log('Push notification subscription successful');
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribeToPush,
  };
}
