"use client";

import { safeId } from "@/lib/safe-id";

type Props = {
  targetId: string;
  role?: "ADMIN" | "FM" | "WHS" | "DM" | "SM" | "AM" | "ANON";
};

async function post(action: "grant" | "deny" | "request", payload: Record<string, unknown>) {
  const res = await fetch("/api/approvals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Trace-Id": safeId(),
      "Idempotency-Key": safeId(),
    },
    body: JSON.stringify({ action, ...payload }),
  });
  return res.json();
}

export default function ApproveDeny({ targetId, role }: Props) {
  // Fallback role detection from cookie if not provided by server
  if (!role && typeof document !== "undefined") {
    const m = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
    role = (m ? decodeURIComponent(m[1]) : "ANON") as Props["role"];
  }

  const canAct = role === "ADMIN" || role === "FM";

  const onClick = async (action: "grant" | "deny") => {
    const payload = { targetId, actionAt: Date.now() };
    const result = await post(action, payload);
    const ok = (result && result.ok) === true;
    const msg = ok ? `Approval ${action}ed` : (result?.error?.message ?? "Error");
    alert(msg);
  };

  if (!canAct) return null;

  return (
    <div className="flex items-center gap-2">
      <button className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700" onClick={() => onClick("grant")}>
        Approve
      </button>
      <button className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => onClick("deny")}>
        Deny
      </button>
    </div>
  );
}
