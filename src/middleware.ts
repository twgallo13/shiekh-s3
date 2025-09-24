import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import * as audit from "./lib/audit";

const SKIP_PREFIXES = ["/_next", "/static", "/favicon", "/api/health", "/api/metrics"];
const RATE = Number(process.env.AUDIT_SAMPLE_RATE ?? "0.1");

export function middleware(req: NextRequest) {
  try {
    const url = req.nextUrl.pathname;
    if (SKIP_PREFIXES.some(p => url === p || url.startsWith(p))) return NextResponse.next();

    if (Math.random() < RATE) {
      const roleCookie = req.cookies.get("x-role")?.value ?? "ANON";
      // Best-effort: keep synchronous and swallow failures
      audit.logAudit({
        actor: roleCookie,
        action: "request.sample",
        payload: { path: url, method: req.method, ts: Date.now() }
      }).catch(() => {});
    }
  } catch { /* swallow */ }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
