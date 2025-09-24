"use client";

import { useEffect, useMemo, useState } from "react";
import { safeId } from "@/lib/safe-id";

type ApiError = { error?: { code?: string; message?: string; details?: unknown } };
type AuditRow = { id?: string; actor?: string; action?: string; ts?: number | string; payload?: unknown; actorRole?: string };

function getRoleFromCookie(): string {
  if (typeof document === "undefined") return "ANON";
  const m = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "ANON";
}

async function postApproval(action: "request" | "grant" | "deny", body: Record<string, unknown>) {
  const res = await fetch("/api/approvals", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Trace-Id": safeId(),
      "Idempotency-Key": safeId(),
    },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json();
  return { ok: res.ok && data?.ok === true, data };
}

async function getAudit(query: URLSearchParams) {
  const res = await fetch(`/api/audit?${query.toString()}`, {
    headers: {
      "X-Trace-Id": safeId(),
      "Idempotency-Key": safeId(),
    },
  });
  const data = await res.json();
  return { ok: res.ok && !data?.error, data };
}

async function postForecast(body: Record<string, unknown>) {
  const res = await fetch("/api/forecast-demo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Trace-Id": safeId(),
      "Idempotency-Key": safeId(),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { ok: res.ok && data?.ok, data };
}

export default function DashboardPage() {
  // role
  const role = getRoleFromCookie();
  const canAct = role === "ADMIN" || role === "FM";

  // approvals state
  const [targetId, setTargetId] = useState("sample-approval-1");
  const [statusMsg, setStatusMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [working, setWorking] = useState<null | "request" | "grant" | "deny">(null);

  // audit state
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // forecast state
  const [fcstId, setFcstId] = useState<string>("");
  const [fcstBusy, setFcstBusy] = useState(false);
  const [fcstMsg, setFcstMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const auditParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "10");
    p.set("offset", "0");
    return p;
  }, []);

  async function refreshAudit() {
    setLoadingAudit(true);
    setAuditError(null);
    const { ok, data } = await getAudit(auditParams);
    if (!ok) {
      const msg = (data as ApiError)?.error?.message || "Access denied or no reader available.";
      setAuditRows([]);
      setAuditError(msg);
    } else {
      setAuditRows(Array.isArray(data.items) ? data.items : []);
      setAuditError(null);
    }
    setLoadingAudit(false);
  }

  useEffect(() => {
    refreshAudit();
    // Expose refreshAudit to window for forecast card to use
    (window as any).__refreshAudit = refreshAudit;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(action: "request" | "grant" | "deny") {
    setWorking(action);
    setStatusMsg(null);
    const { ok, data } = await postApproval(action, { targetId, actionAt: Date.now() });
    if (ok) {
      setStatusMsg({ kind: "ok", text: `Success: ${action}` });
      refreshAudit();
    } else {
      const msg = (data as ApiError)?.error?.message || "Operation failed";
      setStatusMsg({ kind: "err", text: msg });
    }
    setWorking(null);
  }

  async function runForecast() {
    setFcstBusy(true);
    setFcstMsg(null);
    const id = `fcst-${Date.now()}`;
    setFcstId(id);
    const { ok, data } = await postForecast({ id, params: { horizonDays: 7, items: 5 }, delayMs: 1000 });
    if (ok) {
      setFcstMsg({ kind: "ok", text: `Forecast completed: ${id}` });
      // Refresh audit to show the new forecast events
      try { (window as any).__refreshAudit?.(); } catch {}
    } else {
      const msg = data?.error?.message || "Forecast failed";
      setFcstMsg({ kind: "err", text: msg });
    }
    setFcstBusy(false);
  }

  return (
    <main className="container mx-auto px-4 py-6 space-y-8">
      {/* Quick Approvals */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Quick Approvals</h2>
          <span className="text-xs text-gray-500">Role: {role}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="border rounded px-3 py-2 w-full sm:w-80"
            placeholder="Target ID"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => act("request")}
              disabled={working !== null || !targetId}
              className="px-3 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
            >
              {working === "request" ? "Requesting…" : "Request Approval"}
            </button>
            {canAct && (
              <>
                <button
                  onClick={() => act("grant")}
                  disabled={working !== null || !targetId}
                  className="px-3 py-2 rounded bg-green-600 text-white disabled:opacity-50"
                >
                  {working === "grant" ? "Granting…" : "Approve"}
                </button>
                <button
                  onClick={() => act("deny")}
                  disabled={working !== null || !targetId}
                  className="px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50"
                >
                  {working === "deny" ? "Denying…" : "Deny"}
                </button>
              </>
            )}
          </div>
        </div>

        {statusMsg && (
          <div
            className={`mt-3 rounded border px-3 py-2 ${
              statusMsg.kind === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {statusMsg.text}
          </div>
        )}
        {!canAct && (
          <div className="mt-3 text-xs text-gray-600">
            Approve/Deny buttons are visible to <b>ADMIN</b>/<b>FM</b> only. (Set cookie <code>x-role</code> accordingly in dev.)
          </div>
        )}
      </section>

      {/* Forecast Demo */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Forecast Demo</h2>
          {fcstId ? <span className="text-xs text-gray-500">Last run: {fcstId}</span> : null}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={runForecast}
            disabled={fcstBusy}
            className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50"
          >
            {fcstBusy ? "Running…" : "Run Forecast"}
          </button>
          <span className="text-xs text-gray-600">Emits ForecastRunStarted / ForecastRunCompleted</span>
        </div>
        {fcstMsg && (
          <div
            className={`mt-3 rounded border px-3 py-2 ${
              fcstMsg.kind === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {fcstMsg.text}
          </div>
        )}
      </section>

      {/* Recent Audit */}
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Audit</h2>
          <button
            onClick={refreshAudit}
            disabled={loadingAudit}
            className="px-3 py-1 rounded border text-sm disabled:opacity-50"
          >
            {loadingAudit ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {auditError && (
          <div className="rounded border px-3 py-2 bg-yellow-50 border-yellow-200 text-yellow-800">
            {auditError}
          </div>
        )}

        {!auditError && auditRows.length === 0 && (
          <div className="rounded border px-3 py-2 bg-gray-50 border-gray-200 text-gray-700">
            No audit entries yet.
          </div>
        )}

        {auditRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-3">Time</th>
                  <th className="py-2 pr-3">Actor</th>
                  <th className="py-2 pr-3">Role</th>
                  <th className="py-2 pr-3">Action</th>
                  <th className="py-2 pr-3">Payload</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((e, i) => (
                  <tr key={e.id ?? i} className="border-b align-top">
                    <td className="py-2 pr-3">
                      {typeof e.ts === "number" ? new Date(e.ts).toISOString() : (e.ts || "")}
                    </td>
                    <td className="py-2 pr-3">{String(e.actor ?? "")}</td>
                    <td className="py-2 pr-3">{String((e as any).actorRole ?? "")}</td>
                    <td className="py-2 pr-3">{String(e.action ?? "")}</td>
                    <td className="py-2 pr-3 whitespace-pre-wrap break-words">
                      {JSON.stringify(e.payload ?? {}, null, 2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}