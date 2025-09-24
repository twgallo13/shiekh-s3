import { NextResponse } from "next/server";
import { replenishmentDraftCreated } from "@/lib/forecast-events"; // exports this event helper

function sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

export async function POST(req: Request) {
  const traceId = (req.headers as any).get?.("x-trace-id") || "";
  const idemKey = (req.headers as any).get?.("idempotency-key") || "";

  try {
    const body = await req.json().catch(() => ({}));
    const draftId = body?.draftId || `repl-${Date.now()}`;
    const items = Array.isArray(body?.items) ? body.items : [
      { sku: "SKU-1001", qty: 12 },
      { sku: "SKU-1002", qty: 8  },
      { sku: "SKU-1003", qty: 5  },
    ];

    // simulate quick processing
    await sleep(typeof body?.delayMs === "number" ? Math.max(0, body.delayMs) : 600);

    await replenishmentDraftCreated({ draftId, items, ts: Date.now() });

    return NextResponse.json(
      { ok: true, draftId, itemsCount: items.length },
      { headers: { "X-Trace-Id": traceId, "Idempotency-Key": idemKey } }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: { code: "SYS_001", message: "Internal server error", details: { msg: e?.message ?? "" } } },
      { status: 500, headers: { "X-Trace-Id": traceId, "Idempotency-Key": idemKey } }
    );
  }
}
