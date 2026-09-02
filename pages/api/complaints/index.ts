import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Complaint } from '@/backend/database/complaints/complaint.model';
import { User } from '@/backend/database/users/user.model';
import { findOrganizationForComplaint } from '@/backend/services/routingService/routingService';
import connectDB from '@/lib/mongodb';
import { rateLimit, rateLimits } from '@/lib/rateLimit';

export const config = {
  api: {
    bodyParser: { sizeLimit: '12mb' },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await connectDB();

  // GET /api/complaints - List complaints
  if (method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions);
      const isAdmin = (session?.user as any)?.role === 'admin';
      const userId = session ? (session.user as any)?.id : null;

      const { status, category, page = '1', limit = '10' } = req.query;
      const query: any = {};

      // Non-authenticated requests only get count (for home page stats)
      if (!session) {
        const total = await Complaint.countDocuments();
        return res.status(200).json({
          success: true,
          data: [],
          pagination: { page: 1, limit: 1, total, totalPages: 1 },
        });
      }

      // Citizens can only see their own complaints
      if (!isAdmin) {
        query.userId = userId;
      } else if (req.query.userId) {
        // Admin can filter by specific user
        query.userId = req.query.userId;
      }

      if (status && typeof status === 'string') query.status = status;
      if (category && typeof category === 'string') query.issueCategory = category;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const [complaints, total] = await Promise.all([
        Complaint.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Complaint.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        data: complaints,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error) {
      console.error('Error fetching complaints:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
    }
  }

  // POST /api/complaints - Create new complaint
  if (method === 'POST') {
    if (rateLimit(req, res, rateLimits.complaint)) return;
    try {
      const session = await getServerSession(req, res, authOptions);

      if (!session?.user?.email) {
        return res.status(401).json({ success: false, error: 'Please sign in to submit a complaint' });
      }

      const user = await User.findOne({ email: session.user.email });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const {
        title,
        description,
        category,
        severity,
        location,
        images = [],
        voiceTranscript,
        aiAnalysis,
      } = req.body;

      if (!title || !description || !category || !severity || !location) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const validCategories = ['pothole', 'garbage', 'water_leakage', 'streetlight', 'drainage', 'traffic_signal', 'road_damage', 'other'];
      const validSeverities = ['low', 'medium', 'high', 'critical'];

      if (typeof title !== 'string' || title.trim().length === 0 || title.length > 200) {
        return res.status(400).json({ success: false, error: 'Title must be 1-200 characters' });
      }
      if (typeof description !== 'string' || description.trim().length === 0 || description.length > 5000) {
        return res.status(400).json({ success: false, error: 'Description must be 1-5000 characters' });
      }
      if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, error: 'Invalid category' });
      }
      if (!validSeverities.includes(severity)) {
        return res.status(400).json({ success: false, error: 'Invalid severity' });
      }
      if (!Array.isArray(images) || images.length > 10) {
        return res.status(400).json({ success: false, error: 'Maximum 10 images allowed' });
      }

      // Normalize location: accept {lat, lng} or {latitude, longitude}
      const normalizedLocation = {
        latitude: location.latitude ?? location.lat,
        longitude: location.longitude ?? location.lng,
        address: location.address || '',
        city: location.city || extractCityFromAddress(location.address || ''),
      };

      if (typeof normalizedLocation.latitude !== 'number' || typeof normalizedLocation.longitude !== 'number') {
        return res.status(400).json({ success: false, error: 'Invalid location' });
      }

      // Generate unique complaint ID
      const complaintId = `CIV-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 4).toUpperCase()}`;

      // Find organization for routing
      const city = normalizedLocation.city || 'karachi';
      const routing = await findOrganizationForComplaint(category, city);

      const complaint = new Complaint({
        complaintId,
        userId: user._id,
        title,
        description,
        issueCategory: category,
        severity,
        status: 'pending',
        location: normalizedLocation,
        images,
        voiceTranscript,
        aiAnalysis: aiAnalysis || {
          issueCategory: category,
          confidence: 0.5,
          severity,
          description: description,
          suggestedTitle: title,
        },
        assignedOrganization: routing?.organization.name,
      });

      await complaint.save();

      return res.status(201).json({
        success: true,
        data: {
          ...complaint.toObject(),
          complaintId,
        },
        message: 'Complaint submitted successfully',
      });
    } catch (error) {
      console.error('Error creating complaint:', error);
      return res.status(500).json({ success: false, error: 'Failed to create complaint' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}

function extractCityFromAddress(address: string): string {
  const cities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad', 'multan', 'hyderabad', 'peshawar', 'quetta', 'gujranwala', 'sialkot', 'bahawalpur'];
  const lower = address.toLowerCase();
  const found = cities.find(city => lower.includes(city));
  return found || 'karachi';
}
