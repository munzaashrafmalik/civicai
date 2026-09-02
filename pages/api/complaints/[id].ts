import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Complaint } from '@/backend/database/complaints/complaint.model';
import connectDB from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await connectDB();

    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ success: false, error: 'Please sign in to view complaint details' });
    }

    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Complaint ID is required' });
    }

    const isAdmin = (session.user as any)?.role === 'admin';
    const userId = (session.user as any)?.id;

    // Try to find by complaintId (public ID like CIV-123456) or MongoDB _id
    const complaint = await Complaint.findOne({
      $or: [{ complaintId: id }, ...(isValidObjectId(id) ? [{ _id: id }] : [])],
    }).lean();

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    // Citizens can only view their own complaints
    if (!isAdmin && complaint.userId.toString() !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaint' });
  }
}

function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
