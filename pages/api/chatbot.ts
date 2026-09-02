import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimit, rateLimits } from '@/lib/rateLimit';

const DASHSCOPE_BASE_URL = process.env.DASHSCOPE_BASE_URL || 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_ENDPOINT = DASHSCOPE_BASE_URL + '/chat/completions';
const CHATBOT_MODEL = process.env.DASHSCOPE_TEXT_MODEL || 'qwen-plus-character';

const SYSTEM_PROMPT = `You are CivicAI Assistant, a helpful AI chatbot for the CivicAI platform — a smart civic complaint and assistance platform for Pakistan.

Your role:
- Help citizens report civic issues (potholes, garbage, water leakage, streetlights, drainage, traffic signals, road damage)
- Guide users on how to use the CivicAI platform (filing complaints, tracking status, profile settings)
- Answer questions about civic services and municipal processes in Pakistan
- Respond in the same language the user writes in (English or Urdu)
- Be friendly, concise, and helpful
- If asked about specific complaint status, remind them to check their dashboard
- Do NOT make up complaint tracking numbers or fake status updates
- Keep responses under 150 words

You are NOT a government official. You are an AI assistant that helps citizens navigate the platform and understand civic processes.`;

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const LOCAL_RESPONSES: Record<string, string[]> = {
  greeting: [
    'Hello! I\'m your CivicAI assistant. How can I help you today?',
    'Welcome! I can help you with civic issues and guide you through our platform.',
  ],
  complaint: [
    'To file a complaint, go to the "File Complaint" page. You can upload photos, describe the issue, and select the category. Our AI will analyze it and route it to the right department.',
    'You can report issues like potholes, garbage, water leakage, broken streetlights, and more. Just head to the File Complaint section!',
  ],
  tracking: [
    'You can track your complaints from your dashboard. Each complaint has a status: Pending, In Progress, or Resolved. Go to "My Complaints" to see updates.',
  ],
  categories: [
    'CivicAI supports these categories: Pothole, Garbage, Water Leakage, Streetlight, Drainage, Traffic Signal, and Road Damage. Which issue would you like to report?',
  ],
  help: [
    'I can help you with: filing complaints, tracking status, understanding categories, and navigating the platform. What do you need?',
  ],
  default: [
    'Thanks for your message! I\'m here to help with civic issues and platform guidance. You can ask me about filing complaints, tracking status, or any civic service questions.',
    'I\'d be happy to help! Try asking about how to file a complaint, track an issue, or what categories of civic problems you can report.',
  ],
};

function localFallback(message: string): string {
  const lower = message.toLowerCase();

  if (/^(hi|hello|hey|salam|assalam|marhaba)/.test(lower)) {
    return pick(LOCAL_RESPONSES.greeting);
  }
  if (lower.includes('complaint') || lower.includes('report') || lower.includes('file') || lower.includes('شکایت') || lower.includes('رپورٹ')) {
    return pick(LOCAL_RESPONSES.complaint);
  }
  if (lower.includes('track') || lower.includes('status') || lower.includes('progress') || lower.includes('ٹریک')) {
    return pick(LOCAL_RESPONSES.tracking);
  }
  if (lower.includes('category') || lower.includes('type') || lower.includes('categories') || lower.includes('زمرہ')) {
    return pick(LOCAL_RESPONSES.categories);
  }
  if (lower.includes('help') || lower.includes('how') || lower.includes('what') || lower.includes('مدد')) {
    return pick(LOCAL_RESPONSES.help);
  }
  return pick(LOCAL_RESPONSES.default);
}

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  if (rateLimit(req, res, rateLimits.chatbot)) return;

  const { message, history } = req.body as { message?: string; history?: ChatMessage[] };

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  if (message.length > 1000) {
    return res.status(400).json({ success: false, error: 'Message too long (max 1000 characters)' });
  }

  const safeHistory = Array.isArray(history)
    ? history.slice(-10).filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string').map(m => ({ role: m.role, content: m.content.slice(0, 500) }))
    : [];

  if (process.env.DASHSCOPE_API_KEY) {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...safeHistory,
        { role: 'user', content: message.trim() },
      ];

      const response = await fetch(DASHSCOPE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify({
          model: CHATBOT_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error(`DashScope API error ${response.status}`);
      }

      const data = await response.json();
      const reply: string = data?.choices?.[0]?.message?.content?.trim() || localFallback(message);

      return res.status(200).json({ success: true, data: { reply } });
    } catch (error) {
      console.error('Chatbot DashScope call failed, using fallback:', error);
    }
  }

  const reply = localFallback(message);
  return res.status(200).json({ success: true, data: { reply } });
}
