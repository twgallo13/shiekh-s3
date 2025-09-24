import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuditLogEntry {
  actor: string;
  action: string;
  payload?: Record<string, unknown>;
  reason?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        ts: new Date(),
        actor: entry.actor,
        action: entry.action,
        payload: JSON.stringify(entry.payload || {}),
        reason: entry.reason,
      },
    });
  } catch (error) {
    console.error('Failed to log audit entry:', error);
    // Don't throw - audit logging should not break the main flow
  }
}

export async function getAuditLogs(limit = 100, offset = 0) {
  return prisma.auditLog.findMany({
    take: limit,
    skip: offset,
    orderBy: { ts: 'desc' },
  });
}
