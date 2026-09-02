import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Organization } from '@/backend/database/organizations/organization.model';
import connectDB from '@/lib/mongodb';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  await connectDB();

  if (method === 'GET') {
    try {
      const { city, category, isActive } = req.query;
      const query: any = {};

      if (city && typeof city === 'string') {
        query.city = { $regex: escapeRegex(city), $options: 'i' };
      }
      if (category && typeof category === 'string') query.categories = { $in: [category] };
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const organizations = await Organization.find(query)
        .select('-apiKey')
        .sort({ name: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: organizations,
      });
    } catch (error) {
      console.error('Error fetching organizations:', error);
      return res.status(500).json({ success: false, error: 'Failed to fetch organizations' });
    }
  }

  if (method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      if (!session || (session.user as any)?.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }

      const { name, nameUrdu, city, email, phone, address, categories, coordinates } = req.body;

      if (!name || !city || !email || !categories?.length) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
        return res.status(400).json({ success: false, error: 'Invalid organization name' });
      }
      if (typeof city !== 'string' || city.length > 100) {
        return res.status(400).json({ success: false, error: 'Invalid city' });
      }

      const existingOrg = await Organization.findOne({ email: email.toLowerCase() });
      if (existingOrg) {
        return res.status(409).json({ success: false, error: 'Organization with this email already exists' });
      }

      const organization = new Organization({
        name: name.trim(),
        nameUrdu: nameUrdu?.trim(),
        city: city.trim().toLowerCase(),
        email: email.toLowerCase().trim(),
        phone,
        address,
        categories,
        coordinates,
        isActive: true,
      });

      await organization.save();

      return res.status(201).json({
        success: true,
        data: organization,
        message: 'Organization created successfully',
      });
    } catch (error) {
      console.error('Error creating organization:', error);
      return res.status(500).json({ success: false, error: 'Failed to create organization' });
    }
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}