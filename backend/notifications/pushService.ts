import webpush from 'web-push';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:munza12@example.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscription,
  title: string,
  body: string,
  icon: string = '/icon-192x192.png',
  url: string = '/'
) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.log('Push notifications not configured, skipping');
    return { success: false, error: 'Push not configured' };
  }

  const payload = JSON.stringify({
    title,
    body,
    icon,
    badge: '/badge-72x72.png',
    url,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await webpush.sendNotification(subscription as any, payload);
    console.log('Push notification sent:', result.statusCode);
    return { success: true, statusCode: result.statusCode };
  } catch (error: any) {
    console.error('Push notification failed:', error);
    return { success: false, error: error.message };
  }
}

export function generateVAPIDKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  console.log('VAPID Public Key:', vapidKeys.publicKey);
  console.log('VAPID Private Key:', vapidKeys.privateKey);
  return vapidKeys;
}
