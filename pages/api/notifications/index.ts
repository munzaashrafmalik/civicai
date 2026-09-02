import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
} from '@/backend/notifications/notificationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userId = (session.user as any).id;

  await connectDB();

  if (req.method === 'GET') {
    try {
      const notifications = await getUserNotifications(userId);
      const unreadCount = await getUnreadCount(userId);
      return res.status(200).json({ notifications, unreadCount });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  if (req.method === 'POST') {
    const { action, notificationId } = req.body;

    if (action === 'markRead') {
      if (!notificationId) {
        return res.status(400).json({ error: 'Notification ID required' });
      }
      await markNotificationAsRead(notificationId, userId);
      return res.status(200).json({ success: true });
    }

    if (action === 'markAllRead') {
      await markAllNotificationsAsRead(userId);
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
