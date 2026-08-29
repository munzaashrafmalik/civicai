import type { NextApiRequest, NextApiResponse } from 'next';
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
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, error: 'Complaint ID is required' });
    }

    // Try to find by complaintId (public ID like CIV-123456) or MongoDB _id
    const complaint = await Complaint.findOne({
      $or: [{ complaintId: id }, ...(isValidObjectId(id) ? [{ _id: id }] : [])],
    }).lean();

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
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
