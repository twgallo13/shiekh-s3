"use client";

import { useEffect, useMemo, useState } from "react";

type Row = {
  id?: string;
  actor?: string;
  actorRole?: string;
  action?: string;
  payload?: unknown;
  ts?: number | string;
  [k: string]: unknown;
};

export default function AuditPage() {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  // filters
  const [actorUserId, setActorUserId] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [correlationId, setCorrelationId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    if (actorUserId) p.set("actorUserId", actorUserId);
    if (actorRole) p.set("actorRole", actorRole);
    if (correlationId) p.set("correlationId", correlationId);
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    p.set("limit", String(limit));
    p.set("offset", String(offset));
    return p.toString();
  }, [actorUserId, actorRole, correlationId, from, to, limit, offset]);

  async function load() {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/audit?${query}`, { headers: { "X-Trace-Id": crypto.randomUUID(), "Idempotency-Key": crypto.randomUUID() } });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error?.message || "Failed");
      setRows(data.items || []);
      setTotal(data.totalCount || 0);
    } catch (e: any) {
      setError(e?.message || "Failed");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* auto-load on first mount */ }, []); // eslint-disable-line

  const nextDisabled = offset + limit >= total;
  const prevDisabled = offset === 0;

  return (
    <main className="container mx-auto px-4 py-6 space-y-4">
      <h1 className="text-xl font-semibold">Audit (Recent)</h1>

      {/* Filters */}
      <form className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" onSubmit={(e) => { e.preventDefault(); setOffset(0); load(); }}>
        <input className="border rounded px-2 py-1" placeholder="actorUserId" value={actorUserId} onChange={e=>setActorUserId(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="actorRole" value={actorRole} onChange={e=>setActorRole(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="correlationId" value={correlationId} onChange={e=>setCorrelationId(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="from (ISO)" value={from} onChange={e=>setFrom(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="to (ISO)" value={to} onChange={e=>setTo(e.target.value)} />
        <select className="border rounded px-2 py-1" value={limit} onChange={e=>setLimit(Number(e.target.value))}>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <button className="border rounded px-3 py-1" type="submit">Apply</button>
      </form>

      {/* Table / states */}
      {loading && <div className="rounded border p-3 bg-gray-50">Loading…</div>}
      {error && <div className="rounded border p-3 bg-red-50 text-red-700">{error}</div>}
      {!loading && !error && rows.length === 0 && <div className="rounded border p-3 bg-gray-50">No results.</div>}

      {rows.length > 0 && (
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
              {rows.map((e, i) => (
                <tr key={e.id ?? i} className="border-b align-top">
                  <td className="py-2 pr-3">{typeof e.ts === "number" ? new Date(e.ts).toISOString() : (e.ts || "")}</td>
                  <td className="py-2 pr-3">{String(e.actor ?? "")}</td>
                  <td className="py-2 pr-3">{String((e as any).actorRole ?? "")}</td>
                  <td className="py-2 pr-3">{String(e.action ?? "")}</td>
                  <td className="py-2 pr-3 whitespace-pre-wrap break-words">{JSON.stringify(e.payload ?? {}, null, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <button className="border rounded px-3 py-1 disabled:opacity-50" disabled={prevDisabled} onClick={() => { setOffset(Math.max(0, offset - limit)); load(); }}>Prev</button>
        <div className="text-sm">
          {offset + 1}-{Math.min(offset + limit, total)} of {total}
        </div>
        <button className="border rounded px-3 py-1 disabled:opacity-50" disabled={nextDisabled} onClick={() => { setOffset(offset + limit); load(); }}>Next</button>
      </div>
    </main>
  );
}