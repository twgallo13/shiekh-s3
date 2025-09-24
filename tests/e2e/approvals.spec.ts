import { test, expect } from '@playwright/test';

test.describe('Approvals API', () => {
  test('should handle approval request', async ({ request }) => {
    const response = await request.post('/api/approvals', {
      data: {
        action: 'request',
        itemId: 'test-123',
        description: 'Test approval request'
      }
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toEqual({ ok: true });
  });

  test('should return 403 for grant without proper role', async ({ request }) => {
    const response = await request.post('/api/approvals', {
      data: {
        action: 'grant',
        itemId: 'test-123'
      }
    });

    expect(response.status()).toBe(403);
    
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: 'forbidden' });
  });

  test('should return 400 for invalid action', async ({ request }) => {
    const response = await request.post('/api/approvals', {
      data: {
        action: 'invalid',
        itemId: 'test-123'
      }
    });

    expect(response.status()).toBe(400);
    
    const data = await response.json();
    expect(data).toEqual({ ok: false, error: 'invalid action' });
  });
});
