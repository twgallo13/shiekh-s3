import { NextResponse } from "next/server";
import { clearDevEvents } from "@/lib/dev-events-buffer";

export async function POST() {
  clearDevEvents();
  return NextResponse.json({ ok: true });
}
