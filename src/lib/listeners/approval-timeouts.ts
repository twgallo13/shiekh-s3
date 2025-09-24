import { on } from "../events";
import { approvalDenied } from "../approval-events";

type TimerMap = Map<string, ReturnType<typeof setTimeout>>;

const timers: TimerMap = new Map();
// Default 24h; configurable via NEXT_PUBLIC_APPROVAL_TTL_MS
const TTL_MS = Number.parseInt(process.env.NEXT_PUBLIC_APPROVAL_TTL_MS || "", 10) || 24 * 60 * 60 * 1000;

function keyFromPayload(p: Record<string, unknown>): string | null {
  // prefer explicit targetId; fallback to id
  const tid = (p?.targetId ?? p?.id) as string | undefined;
  return typeof tid === "string" && tid.length > 0 ? tid : null;
}

function startTimer(targetId: string, payload: Record<string, unknown>) {
  // clear if exists then start new
  cancelTimer(targetId);
  const handle = setTimeout(async () => {
    try {
      // auto-deny on timeout; include reason + original seed
      await approvalDenied({ targetId, reason: "timeout", ts: Date.now(), seed: payload });
    } catch {/* swallow */}
    timers.delete(targetId);
  }, TTL_MS);
  timers.set(targetId, handle);
}

function cancelTimer(targetId: string) {
  const t = timers.get(targetId);
  if (t) {
    clearTimeout(t);
    timers.delete(targetId);
  }
}

if (typeof process !== "undefined") {
  // When an approval is requested, start/refresh TTL timer
  on("ApprovalRequested", (p: any) => {
    const k = keyFromPayload(p || {});
    if (k) startTimer(k, p || {});
  });

  // On grant/deny, cancel TTL timer
  on("ApprovalGranted", (p: any) => {
    const k = keyFromPayload(p || {});
    if (k) cancelTimer(k);
  });
  on("ApprovalDenied", (p: any) => {
    const k = keyFromPayload(p || {});
    if (k) cancelTimer(k);
  });
}

export {};
