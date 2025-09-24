import { NextResponse } from "next/server";
import { approvalRequested, approvalGranted, approvalDenied } from "@/lib/approval-events";
import { forecastRunStarted, forecastRunCompleted, replenishmentDraftCreated } from "@/lib/forecast-events";

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function POST(req: Request) {
  const traceId = (req.headers as any).get?.("x-trace-id") || "";
  const idemKey = (req.headers as any).get?.("idempotency-key") || "";
  try {
    const base = Date.now();
    // approvals: 1 request + grant, 1 request + deny
    await approvalRequested({ targetId: `seed-appr-${base}-1`, note: "seed request", ts: Date.now() });
    await approvalGranted({ targetId: `seed-appr-${base}-1`, by: "SYSTEM", ts: Date.now() });
    await approvalRequested({ targetId: `seed-appr-${base}-2`, note: "seed request", ts: Date.now() });
    await approvalDenied({ targetId: `seed-appr-${base}-2`, by: "SYSTEM", reason: "seed-deny", ts: Date.now() });

    // forecast: start + complete
    await forecastRunStarted({ id: `seed-fcst-${base}`, params: { horizonDays: 7, items: 3 }, ts: Date.now() });
    await sleep(150);
    await forecastRunCompleted({ id: `seed-fcst-${base}`, result: { summary: { itemsProcessed: 3, horizonDays: 7 } }, ts: Date.now() });

    // replenishment: 1 draft
    await replenishmentDraftCreated({ draftId: `seed-repl-${base}`, items: [{ sku: "SKU-X", qty: 2 }, { sku: "SKU-Y", qty: 1 }], ts: Date.now() });

    return NextResponse.json({ ok: true, count: 6 }, { headers: { "X-Trace-Id": traceId, "Idempotency-Key": idemKey } });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "SYS_001", message: "Internal server error", details: { msg: e?.message ?? "" } } },
      { status: 500, headers: { "X-Trace-Id": traceId, "Idempotency-Key": idemKey } }
    );
  }
}
