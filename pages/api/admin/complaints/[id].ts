import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { isValidObjectId } from 'mongoose';
import { authOptions } from '@/lib/auth';
import { Complaint } from '@/backend/database/complaints/complaint.model';
import connectDB from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PATCH' && req.method !== 'PUT') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await connectDB();
    const session = await getServerSession(req, res, authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const { id } = req.query;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'in_progress', 'resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const filter: any = isValidObjectId(String(id))
      ? { _id: id }
      : { complaintId: id };

    const updateData: any = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (status === 'resolved') updateData.resolvedAt = new Date();

    const complaint = await Complaint.findOneAndUpdate(filter, updateData, { new: true }).lean();

    if (!complaint) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
      message: 'Status updated successfully',
    });
  } catch (error) {
    console.error('Update complaint status error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update status' });
  }
}
