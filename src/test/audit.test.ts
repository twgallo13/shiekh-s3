import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAudit } from '@/lib/audit';

// Mock Prisma Client
const mockCreate = vi.fn();
const mockFindMany = vi.fn();

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    auditLog: {
      create: mockCreate,
      findMany: mockFindMany,
    },
  })),
}));

describe('Audit Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should log audit entry successfully', async () => {
    mockCreate.mockResolvedValue({ id: 'test-id' });

    await logAudit({
      actor: 'test-user',
      action: 'TEST_ACTION',
      payload: { test: 'data' },
      reason: 'test reason',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        ts: expect.any(Date),
        actor: 'test-user',
        action: 'TEST_ACTION',
        payload: { test: 'data' },
        reason: 'test reason',
      },
    });
  });

  it('should handle audit logging errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockCreate.mockRejectedValue(new Error('Database error'));

    // Should not throw
    await expect(logAudit({
      actor: 'test-user',
      action: 'TEST_ACTION',
    })).resolves.toBeUndefined();

    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to log audit entry:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it('should use default payload when not provided', async () => {
    mockCreate.mockResolvedValue({ id: 'test-id' });

    await logAudit({
      actor: 'test-user',
      action: 'TEST_ACTION',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        ts: expect.any(Date),
        actor: 'test-user',
        action: 'TEST_ACTION',
        payload: {},
        reason: undefined,
      },
    });
  });
});
