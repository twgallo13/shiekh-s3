import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock audit module
vi.mock('@/lib/audit', () => ({
  logAudit: vi.fn(),
}));

import { emit, on } from '@/lib/events';
import * as audit from '@/lib/audit';

describe('Event Bus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should always audit events even if no listeners exist', async () => {
    await emit("ForecastRunStarted", { test: "data" });

    expect(audit.logAudit).toHaveBeenCalledWith({
      actor: "SYSTEM",
      action: "ForecastRunStarted",
      payload: { test: "data" },
    });
  });

  it('should never throw even if a listener throws', async () => {
    const throwingListener = vi.fn().mockRejectedValue(new Error("Listener error"));
    const normalListener = vi.fn().mockResolvedValue(undefined);

    on("ApprovalRequested", throwingListener);
    on("ApprovalRequested", normalListener);

    // Should not throw
    await expect(emit("ApprovalRequested", { test: "data" })).resolves.toBeUndefined();

    expect(throwingListener).toHaveBeenCalledWith({ test: "data" });
    expect(normalListener).toHaveBeenCalledWith({ test: "data" });
    expect(audit.logAudit).toHaveBeenCalled();
  });

  it('should call all listeners for an event', async () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    on("ReplenishmentDraftCreated", listener1);
    on("ReplenishmentDraftCreated", listener2);

    await emit("ReplenishmentDraftCreated", { id: "123" });

    expect(listener1).toHaveBeenCalledWith({ id: "123" });
    expect(listener2).toHaveBeenCalledWith({ id: "123" });
  });

  it('should handle events with no listeners gracefully', async () => {
    // Should not throw
    await expect(emit("ForecastRunCompleted", {})).resolves.toBeUndefined();
    
    expect(audit.logAudit).toHaveBeenCalledWith({
      actor: "SYSTEM",
      action: "ForecastRunCompleted",
      payload: {},
    });
  });

  it('should allow unsubscribing from events', async () => {
    const listener = vi.fn();
    const unsubscribe = on("ApprovalGranted", listener);

    await emit("ApprovalGranted", { id: "1" });
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    await emit("ApprovalGranted", { id: "2" });
    expect(listener).toHaveBeenCalledTimes(1); // Still only called once
  });

  it('should handle audit failures gracefully', async () => {
    (audit.logAudit as any).mockRejectedValue(new Error("Audit failed"));

    const listener = vi.fn();
    on("ApprovalDenied", listener);

    // Should not throw even if audit fails
    await expect(emit("ApprovalDenied", { reason: "test" })).resolves.toBeUndefined();
    
    expect(listener).toHaveBeenCalledWith({ reason: "test" });
  });
});
