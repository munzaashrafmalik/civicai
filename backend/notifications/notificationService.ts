import { Notification } from './notification.model';
import { User } from '../database/users/user.model';
import { sendEmail, getWelcomeEmail, getComplaintStatusEmail } from './emailService';
import { sendPushNotification, PushSubscription } from './pushService';
import mongoose from 'mongoose';

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'welcome' | 'complaint_status' | 'assignment' | 'resolved' | 'general',
  data?: any
) {
  try {
    const notification = await Notification.create({
      userId: new mongoose.Types.ObjectId(userId),
      title,
      message,
      type,
      read: false,
      emailSent: false,
      pushSent: false,
      data,
    });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

export async function sendWelcomeNotification(userId: string) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for welcome notification');
      return;
    }

    const notification = await createNotification(
      userId,
      `Welcome to CivicAI, ${user.name}!`,
      'Thank you for joining CivicAI. Start reporting issues in your area and make your city better!',
      'welcome'
    );

    if (!notification) return;

    // Send email
    const emailContent = getWelcomeEmail(user.name);
    const emailResult = await sendEmail(user.email, emailContent.subject, emailContent.html);
    if (emailResult.success) {
      notification.emailSent = true;
    }

    // Send push notification if subscription exists
    if (user.pushSubscription) {
      const pushResult = await sendPushNotification(
        user.pushSubscription as PushSubscription,
        'Welcome to CivicAI! 🎉',
        `Hi ${user.name}, thank you for joining us!`,
        '/icon-192x192.png',
        '/profile'
      );
      if (pushResult.success) {
        notification.pushSent = true;
      }
    }

    await notification.save();
    console.log('Welcome notification sent to', user.email);
  } catch (error) {
    console.error('Failed to send welcome notification:', error);
  }
}

export async function sendComplaintStatusNotification(
  userId: string,
  complaintTitle: string,
  status: string,
  complaintId: string
) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for complaint status notification');
      return;
    }

    const statusMessages: Record<string, string> = {
      pending: 'Your complaint is pending review',
      in_progress: 'Your complaint is being worked on',
      resolved: 'Your complaint has been resolved! 🎉',
      rejected: 'Your complaint was rejected',
    };

    const message = statusMessages[status] || `Status updated to ${status}`;

    const notification = await createNotification(
      userId,
      `Complaint Update: ${complaintTitle}`,
      message,
      status === 'resolved' ? 'resolved' : 'complaint_status',
      { complaintId, status }
    );

    if (!notification) return;

    // Send email
    const emailContent = getComplaintStatusEmail(user.name, complaintTitle, status);
    const emailResult = await sendEmail(user.email, emailContent.subject, emailContent.html);
    if (emailResult.success) {
      notification.emailSent = true;
    }

    // Send push notification if subscription exists
    if (user.pushSubscription) {
      const pushResult = await sendPushNotification(
        user.pushSubscription as PushSubscription,
        'Complaint Update',
        `${complaintTitle}: ${message}`,
        '/icon-192x192.png',
        `/complaints/${complaintId}`
      );
      if (pushResult.success) {
        notification.pushSent = true;
      }
    }

    await notification.save();
    console.log('Complaint status notification sent to', user.email);
  } catch (error) {
    console.error('Failed to send complaint status notification:', error);
  }
}

export async function getUserNotifications(userId: string, limit: number = 50) {
  try {
    const notifications = await Notification.find({
      userId: new mongoose.Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifications;
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  try {
    await Notification.updateOne(
      {
        _id: notificationId,
        userId: new mongoose.Types.ObjectId(userId),
      },
      { read: true }
    );
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    await Notification.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        read: false,
      },
      { read: true }
    );
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
  }
}

export async function getUnreadCount(userId: string) {
  try {
    const count = await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    });
    return count;
  } catch (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
}
