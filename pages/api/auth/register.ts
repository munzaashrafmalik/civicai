import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { User } from '@/backend/database/users/user.model';
import connectDB from '@/lib/mongodb';
import { rateLimit, rateLimits } from '@/lib/rateLimit';
import { sendWelcomeNotification } from '@/backend/notifications/notificationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  if (rateLimit(req, res, rateLimits.register)) return;

  try {
    await connectDB();
    const { name, email, phone, password, language = 'en' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) {
      return res.status(400).json({ success: false, error: 'Name must be 1-100 characters' });
    }

    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address' });
    }

    if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return res.status(400).json({ success: false, error: 'Password must be between 6 and 128 characters' });
    }

    if (phone && (typeof phone !== 'string' || phone.length > 20)) {
      return res.status(400).json({ success: false, error: 'Invalid phone number' });
    }

    if (!['en', 'ur'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Invalid language preference' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      language,
      role: 'citizen',
      isActive: true,
      emailVerified: false, // In production, send verification email
    });

    await user.save();

    // Send welcome notification asynchronously
    sendWelcomeNotification(user._id.toString()).catch(console.error);

    // Return user without sensitive data
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      language: user.language,
      role: user.role,
      createdAt: user.createdAt,
    };

    return res.status(201).json({
      success: true,
      data: userResponse,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed' });
  }
}
