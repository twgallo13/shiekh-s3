import { NextResponse } from "next/server";
import * as metrics from "../../../lib/metrics";

export async function GET() {
  metrics.incHits();
  return NextResponse.json(metrics.snapshot());
}
