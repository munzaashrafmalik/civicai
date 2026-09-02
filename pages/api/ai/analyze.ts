import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { analyzeIssue } from '@/backend/services/aiService/aiService';
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
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (rateLimit(req, res, rateLimits.ai)) return;

  try {
    const { images, voiceTranscript, description, textDescription, location } = req.body;

    const text = textDescription || description;

    if (!images?.length && !voiceTranscript && !text) {
      return res.status(400).json({
        success: false,
        error: 'At least one input (image, voice, or text) is required',
      });
    }

    if (Array.isArray(images) && images.length > 5) {
      return res.status(400).json({ success: false, error: 'Maximum 5 images allowed for analysis' });
    }

    if (text && typeof text === 'string' && text.length > 5000) {
      return res.status(400).json({ success: false, error: 'Text description too long (max 5000 characters)' });
    }

    if (voiceTranscript && typeof voiceTranscript === 'string' && voiceTranscript.length > 5000) {
      return res.status(400).json({ success: false, error: 'Voice transcript too long (max 5000 characters)' });
    }

    const result = await analyzeIssue({
      images,
      voiceTranscript,
      textDescription: text,
      location,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    return res.status(500).json({ success: false, error: 'AI analysis failed' });
  }
}
