import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Complaint } from '@/backend/database/complaints/complaint.model';
import { User } from '@/backend/database/users/user.model';
import { findOrganizationForComplaint } from '@/backend/services/routingService/routingService';
import connectDB from '@/lib/mongodb';

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
      const { userId, status, category, page = '1', limit = '10' } = req.query;
      const query: any = {};

      if (userId) query.userId = userId;
      if (status) query.status = status;
      if (category) query.issueCategory = category;

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
