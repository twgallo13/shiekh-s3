import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma Client
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  })),
}));

// Import after mocking
import { logAudit } from '@/lib/audit';
import { PrismaClient } from '@prisma/client';

describe('Audit Module', () => {
  let mockCreate: ReturnType<typeof vi.fn>;
  let mockFindMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    const mockPrisma = new PrismaClient() as unknown as {
      auditLog: {
        create: ReturnType<typeof vi.fn>;
        findMany: ReturnType<typeof vi.fn>;
      };
    };
    mockCreate = mockPrisma.auditLog.create;
    mockFindMany = mockPrisma.auditLog.findMany;
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
