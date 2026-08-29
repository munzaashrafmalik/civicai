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
    const session = await getServerSession(req, res, authOptions);
    if ((session?.user as any)?.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    await connectDB();

    const { status, page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));

    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Complaint.countDocuments(query),
    ]);

    const mapped = complaints.map((c: any) => ({
      id: c.complaintId || c._id.toString(),
      _id: c._id.toString(),
      title: c.title,
      issueCategory: c.issueCategory,
      severity: c.severity,
      status: c.status,
      location: c.location || {},
      createdAt: c.createdAt,
      userId: c.userId?.toString(),
      assignedOrganization: c.assignedOrganization,
    }));

    return res.status(200).json({
      success: true,
      data: mapped,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('Admin complaints error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch complaints' });
  }
}
