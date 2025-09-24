import { NextResponse } from "next/server";
import { readDevEvents } from "@/lib/dev-events-buffer";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number.parseInt(url.searchParams.get("limit") || "25", 10) || 25;
  const offset = Number.parseInt(url.searchParams.get("offset") || "0", 10) || 0;
  const data = readDevEvents(limit, offset);
  return NextResponse.json({ ok: true, ...data });
}
