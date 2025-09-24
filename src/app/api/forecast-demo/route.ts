import { NextResponse } from "next/server";
import { forecastRunStarted, forecastRunCompleted } from "@/lib/forecast-events";

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function POST(req: Request) {
  // echo observability headers if provided
  const traceId = (req.headers as any).get?.("x-trace-id") || "";
  const idemKey = (req.headers as any).get?.("idempotency-key") || "";

  try {
    const body = await req.json().catch(() => ({}));
    const id = body?.id || `fcst-${Date.now()}`;
    const params = body?.params || { horizonDays: 14, items: 10 };

    await forecastRunStarted({ id, params, ts: Date.now() });

    // simulate work (fast default; can be changed by body.delayMs)
    const delay = typeof body?.delayMs === "number" ? Math.max(0, body.delayMs) : 1200;
    await sleep(delay);

    const result = {
      id,
      summary: { itemsProcessed: params.items, horizonDays: params.horizonDays },
      ok: true,
    };

    await forecastRunCompleted({ id, result, ts: Date.now() });

    return NextResponse.json({ ok: true, id, result }, { headers: { "X-Trace-Id": traceId, "Idempotency-Key": idemKey } });
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "SYS_001", message: "Internal server error", details: { msg: e?.message ?? "" } } },
      { status: 500, headers: { "X-Trace-Id": traceId, "Idempotency-Key": idemKey } }
    );
  }
}
