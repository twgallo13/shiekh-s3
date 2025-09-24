import { NextResponse } from "next/server";
import { approvalRequested, approvalGranted, approvalDenied } from "../../../lib/approval-events";
import { Role, requireRole } from "../../../lib/guards";

export async function POST(req: Request) {
  // Expect { action: "request"|"grant"|"deny", ...meta }
  try {
    const body = await req.json().catch(() => ({}));
    const action = body?.action;
    const meta = { ...body, ts: Date.now() };

    // Example RBAC: only ADMIN/FM can grant/deny; anyone can request
    if (action === "grant" || action === "deny") {
      // For now, we'll use a simple check - in a real app this would check the user's role
      // This is a stub implementation as specified
      const userRole = Role.ADMIN; // Placeholder - would come from session/auth
      const allow = requireRole([Role.ADMIN, Role.FM]);
      if (!allow(userRole)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }

    if (action === "request") await approvalRequested(meta);
    else if (action === "grant") await approvalGranted(meta);
    else if (action === "deny") await approvalDenied(meta);
    else return NextResponse.json({ ok: false, error: "invalid action" }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
