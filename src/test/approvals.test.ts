import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the approval events
vi.mock('@/lib/approval-events', () => ({
  approvalRequested: vi.fn(),
  approvalGranted: vi.fn(),
  approvalDenied: vi.fn(),
}));

// Mock the guards
vi.mock('@/lib/guards', () => ({
  requireRole: vi.fn(),
}));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/approvals/route';
import * as approvalEvents from '@/lib/approval-events';
import * as guards from '@/lib/guards';

describe('Approvals API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle approval request successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ action: 'request', itemId: '123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(approvalEvents.approvalRequested).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'request',
        itemId: '123',
        ts: expect.any(Number),
      })
    );
  });

  it('should return 403 for grant action without proper role', async () => {
    (guards.requireRole as any).mockReturnValue(() => false);

    const request = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ action: 'grant', itemId: '123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ ok: false, error: 'forbidden' });
    expect(approvalEvents.approvalGranted).not.toHaveBeenCalled();
  });

  it('should allow grant action with proper role', async () => {
    (guards.requireRole as any).mockReturnValue(() => true);

    const request = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ action: 'grant', itemId: '123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(approvalEvents.approvalGranted).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'grant',
        itemId: '123',
        ts: expect.any(Number),
      })
    );
  });

  it('should return 400 for invalid action', async () => {
    const request = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ action: 'invalid', itemId: '123' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ ok: false, error: 'invalid action' });
  });

  it('should handle malformed JSON gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(approvalEvents.approvalRequested).toHaveBeenCalledWith(
      expect.objectContaining({
        ts: expect.any(Number),
      })
    );
  });

  it('should handle approval denial', async () => {
    (guards.requireRole as any).mockReturnValue(() => true);

    const request = new NextRequest('http://localhost:3000/api/approvals', {
      method: 'POST',
      body: JSON.stringify({ action: 'deny', itemId: '123', reason: 'insufficient data' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ ok: true });
    expect(approvalEvents.approvalDenied).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'deny',
        itemId: '123',
        reason: 'insufficient data',
        ts: expect.any(Number),
      })
    );
  });
});
