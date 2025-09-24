type EventName =
  | "ForecastRunStarted"
  | "ReplenishmentDraftCreated"
  | "ForecastRunCompleted"
  | "ApprovalRequested"
  | "ApprovalGranted"
  | "ApprovalDenied";

type EventPayload = Record<string, any>;

type Listener = (payload: EventPayload) => Promise<void> | void;

const listeners = new Map<EventName, Set<Listener>>();

export function on(name: EventName, fn: Listener) {
  if (!listeners.has(name)) listeners.set(name, new Set());
  listeners.get(name)!.add(fn);
  return () => listeners.get(name)!.delete(fn);
}

export async function emit(name: EventName, payload: EventPayload = {}) {
  // Always audit; never throw outward
  try {
    const { logAudit } = await import("./audit");
    await logAudit({
      actor: "SYSTEM",
      action: name,
      payload,
    });
  } catch {
    // Swallow audit errors
  }
  const fns = listeners.get(name);
  if (!fns) return;
  for (const fn of fns) {
    try { await fn(payload); } catch { /* swallow */ }
  }
}

export type { EventName, EventPayload, Listener };
