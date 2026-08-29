import type { NextApiRequest, NextApiResponse } from 'next';
import { Organization } from '@/backend/database/organizations/organization.model';
import connectDB from '@/lib/mongodb';

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

      if (city) query.city = { $regex: city, $options: 'i' };
      if (category) query.categories = { $in: [category] };
      if (isActive !== undefined) query.isActive = isActive === 'true';

      const organizations = await Organization.find(query).sort({ name: 1 }).lean();

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
      const { name, nameUrdu, city, email, phone, address, categories, coordinates } = req.body;

      if (!name || !city || !email || !categories?.length) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }

      const organization = new Organization({
        name,
        nameUrdu,
        city,
        email,
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