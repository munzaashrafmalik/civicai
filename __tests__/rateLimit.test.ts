import { rateLimit, rateLimits } from '@/lib/rateLimit';
import type { NextApiRequest, NextApiResponse } from 'next';

function createMockReq(ip: string = '127.0.0.1'): NextApiRequest {
  return {
    headers: { 'x-forwarded-for': ip },
    socket: { remoteAddress: ip },
  } as unknown as NextApiRequest;
}

function createMockRes(): NextApiResponse & { _status?: number; _headers: Record<string, string> } {
  const res: any = {
    _status: undefined,
    _headers: {},
    status(code: number) {
      res._status = code;
      return res;
    },
    json(body: any) {
      res._body = body;
      return res;
    },
    setHeader(key: string, value: string) {
      res._headers[key] = value;
      return res;
    },
  };
  return res;
}

describe('Rate Limiter', () => {
  it('should allow requests within the limit', () => {
    const req = createMockReq('10.0.0.1');
    const res = createMockRes();
    const config = { windowMs: 60000, max: 5, keyPrefix: 'test-allow' };

    for (let i = 0; i < 5; i++) {
      const limited = rateLimit(req, res, config);
      expect(limited).toBe(false);
    }
  });

  it('should block requests exceeding the limit', () => {
    const req = createMockReq('10.0.0.2');
    const res = createMockRes();
    const config = { windowMs: 60000, max: 3, keyPrefix: 'test-block' };

    for (let i = 0; i < 3; i++) {
      rateLimit(req, res, config);
    }

    const limited = rateLimit(req, res, config);
    expect(limited).toBe(true);
    expect(res._status).toBe(429);
  });

  it('should track different IPs separately', () => {
    const config = { windowMs: 60000, max: 2, keyPrefix: 'test-ips' };

    const req1 = createMockReq('10.0.0.3');
    const res1 = createMockRes();
    rateLimit(req1, res1, config);
    rateLimit(req1, res1, config);
    const blocked1 = rateLimit(req1, res1, config);
    expect(blocked1).toBe(true);

    const req2 = createMockReq('10.0.0.4');
    const res2 = createMockRes();
    const allowed2 = rateLimit(req2, res2, config);
    expect(allowed2).toBe(false);
  });

  it('should set rate limit headers', () => {
    const req = createMockReq('10.0.0.5');
    const res = createMockRes();
    const config = { windowMs: 60000, max: 5, keyPrefix: 'test-headers' };

    rateLimit(req, res, config);

    expect(res._headers['X-RateLimit-Limit']).toBe(5);
    expect(res._headers['X-RateLimit-Remaining']).toBe(4);
  });

  it('should have correct predefined rate limit configs', () => {
    expect(rateLimits.auth.max).toBe(20);
    expect(rateLimits.register.max).toBe(10);
    expect(rateLimits.complaint.max).toBe(30);
    expect(rateLimits.ai.max).toBe(20);
  });

  it('should handle x-forwarded-for with multiple IPs', () => {
    const req = {
      headers: { 'x-forwarded-for': '10.0.0.6, 10.0.0.7, 10.0.0.8' },
      socket: { remoteAddress: '127.0.0.1' },
    } as unknown as NextApiRequest;
    const res = createMockRes();
    const config = { windowMs: 60000, max: 2, keyPrefix: 'test-xff' };

    rateLimit(req, res, config);
    rateLimit(req, res, config);
    const blocked = rateLimit(req, res, config);
    expect(blocked).toBe(true);
  });
});
