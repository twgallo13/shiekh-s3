import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: 'next' })),
  },
}));

// Mock audit module
vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn(),
}));

import { middleware } from '@/middleware';
import { NextResponse } from 'next/server';
import * as audit from '@/lib/audit';

describe('Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment
    delete process.env.AUDIT_SAMPLE_RATE;
  });

  it('should skip requests to /api/health', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/api/health' },
      cookies: { get: vi.fn() },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(audit.logAudit).not.toHaveBeenCalled();
  });

  it('should skip requests to /api/metrics', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/api/metrics' },
      cookies: { get: vi.fn() },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(audit.logAudit).not.toHaveBeenCalled();
  });

  it('should skip requests to /_next/* paths', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/_next/static/chunk.js' },
      cookies: { get: vi.fn() },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(audit.logAudit).not.toHaveBeenCalled();
  });

  it('should not log when AUDIT_SAMPLE_RATE=0', async () => {
    process.env.AUDIT_SAMPLE_RATE = '0';
    
    const mockRequest = {
      nextUrl: { pathname: '/some-page' },
      cookies: { get: vi.fn() },
      method: 'GET',
    } as any;

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(audit.logAudit).not.toHaveBeenCalled();
  });

  it('should use ANON role when no x-role cookie', async () => {
    process.env.AUDIT_SAMPLE_RATE = '1'; // 100% sampling
    
    const mockRequest = {
      nextUrl: { pathname: '/some-page' },
      cookies: { get: vi.fn(() => undefined) },
      method: 'GET',
    } as any;

    // Mock Math.random to always return 0 (below 1.0)
    const originalRandom = Math.random;
    Math.random = vi.fn(() => 0);

    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(audit.logAudit).toHaveBeenCalledWith({
      actor: 'ANON',
      action: 'request.sample',
      payload: {
        path: '/some-page',
        method: 'GET',
        ts: expect.any(Number),
      },
    });

    // Restore Math.random
    Math.random = originalRandom;
  });

  it('should handle errors gracefully', async () => {
    const mockRequest = {
      nextUrl: { pathname: '/some-page' },
      cookies: { get: vi.fn(() => { throw new Error('Cookie error'); }) },
      method: 'GET',
    } as any;

    // Should not throw
    const result = await middleware(mockRequest);

    expect(NextResponse.next).toHaveBeenCalled();
  });
});
