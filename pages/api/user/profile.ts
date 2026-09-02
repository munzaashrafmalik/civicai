import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { User } from '@/backend/database/users/user.model';
import connectDB from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.email) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  await connectDB();

  if (req.method === 'GET') {
    try {
      const user = await User.findOne({ email: session.user.email }).lean();

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          language: user.language,
          role: user.role,
          profileImage: user.profileImage || null,
          notificationSettings: user.notificationSettings || {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            statusChanges: true,
            assignmentUpdates: true,
          },
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { name, phone, language, profileImage, notificationSettings } = req.body;

      const updateData: Record<string, any> = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
          return res.status(400).json({ success: false, error: 'Name must be 1-100 characters' });
        }
        updateData.name = name.trim();
      }
      if (phone !== undefined) {
        if (typeof phone !== 'string' || phone.length > 20) {
          return res.status(400).json({ success: false, error: 'Invalid phone number' });
        }
        updateData.phone = phone.trim();
      }
      if (language && ['en', 'ur'].includes(language)) updateData.language = language;
      if (profileImage !== undefined) {
        if (profileImage && typeof profileImage === 'string' && !profileImage.startsWith('data:image/')) {
          return res.status(400).json({ success: false, error: 'Invalid image format' });
        }
        if (profileImage && profileImage.length > 2 * 1024 * 1024) {
          return res.status(400).json({ success: false, error: 'Image too large (max 2MB)' });
        }
        updateData.profileImage = profileImage || null;
      }
      if (notificationSettings && typeof notificationSettings === 'object') {
        const allowed = ['emailNotifications', 'smsNotifications', 'pushNotifications', 'statusChanges', 'assignmentUpdates'];
        const clean: Record<string, boolean> = {};
        for (const key of allowed) {
          if (typeof notificationSettings[key] === 'boolean') {
            clean[key] = notificationSettings[key];
          }
        }
        updateData.notificationSettings = clean;
      }

      const user = await User.findOneAndUpdate(
        { email: session.user.email },
        updateData,
        { new: true }
      ).lean();

      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          language: user.language,
          role: user.role,
          profileImage: user.profileImage || null,
          notificationSettings: user.notificationSettings || {
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            statusChanges: true,
            assignmentUpdates: true,
          },
        },
        message: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
