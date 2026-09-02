import type { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

export function rateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  config: RateLimitConfig
): boolean {
  cleanup();

  const { windowMs, max, keyPrefix = 'global' } = config;
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
    || req.socket.remoteAddress
    || 'unknown';
  const key = `${keyPrefix}:${ip}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, max - entry.count);
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

  res.setHeader('X-RateLimit-Limit', max);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', retryAfter);

  if (entry.count > max) {
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    });
    return true;
  }

  return false;
}

export const rateLimits = {
  auth: { windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'auth' },
  register: { windowMs: 60 * 60 * 1000, max: 10, keyPrefix: 'register' },
  complaint: { windowMs: 15 * 60 * 1000, max: 30, keyPrefix: 'complaint' },
  ai: { windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'ai' },
  chatbot: { windowMs: 15 * 60 * 1000, max: 20, keyPrefix: 'chatbot' },
};
