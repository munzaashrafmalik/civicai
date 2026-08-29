import type { NextApiRequest, NextApiResponse } from 'next';
import { analyzeIssue } from '@/backend/services/aiService/aiService';

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

  try {
    const { images, voiceTranscript, description, textDescription, location } = req.body;

    const text = textDescription || description;

    if (!images?.length && !voiceTranscript && !text) {
      return res.status(400).json({
        success: false,
        error: 'At least one input (image, voice, or text) is required',
      });
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
