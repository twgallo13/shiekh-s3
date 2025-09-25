"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { safeId } from "@/lib/safe-id";
import { APP_VERSION } from "@/app/version";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Toolbar from "@/components/ui/Toolbar";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastHost";
import ToastHost from "@/components/ui/ToastHost";
import NotificationBell from "@/components/ui/NotificationBell";
import Skeleton from "@/components/ui/Skeleton";
import Modal from "@/components/ui/Modal";
import AboutModal from "@/components/app/AboutModal";
import DemoTour from "@/components/app/DemoTour";
import ShortcutsModal from "@/components/ui/ShortcutsModal";
import DataTable from "@/components/ui/DataTable";
import KpiMini from "@/components/ui/KpiMini";
import AcceptancePanel from "@/components/dev/AcceptancePanel";
import { useKpiEditor } from "@/components/dev/KpiEditor";
import CopyButton from "@/components/ui/CopyButton";
import CollapsibleJson from "@/components/ui/CollapsibleJson";
import Tooltip from "@/components/ui/Tooltip";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusBar from "@/components/ui/StatusBar";
import useHotkeys from "@/lib/client/useHotkeys";
import useDebouncedValue from "@/lib/client/useDebouncedValue";
import { getKpisForRole } from "@/lib/kpi/registry";
import { useLayoutPref } from "@/lib/hooks/useLayoutPref";
import "@/lib/tests/acceptance/scenarios.sample";
import { useRole } from "@/components/providers/RoleProvider";
import useRelativeTime from "@/lib/client/useRelativeTime";
import downloadJson from "@/lib/client/downloadJson";
import downloadCsv from "@/lib/client/downloadCsv";

type ApiError = { error?: { code?: string; message?: string; details?: unknown } };
type AuditRow = { id?: string; actor?: string; action?: string; ts?: number | string; payload?: unknown; actorRole?: string };

function getRoleFromCookie(): string {
  if (typeof document === "undefined") return "ANON";
  const m = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "ANON";
}

function toggleDark() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    localStorage.setItem("theme", "light");
  } else {
    document.body.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }
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
  try {
    const res = await fetch(`/api/audit?${query.toString()}`, {
      headers: {
        "X-Trace-Id": safeId(),
        "Idempotency-Key": safeId(),
      },
    });
    
    if (!res.ok) {
      return { ok: false, data: { error: { message: `HTTP ${res.status}: ${res.statusText}` } } };
    }
    
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { ok: false, data: { error: { message: 'Invalid response format' } } };
    }
    
    const text = await res.text();
    if (!text.trim()) {
      return { ok: false, data: { error: { message: 'Empty response' } } };
    }
    
    const data = JSON.parse(text);
    return { ok: !data?.error, data };
  } catch (error) {
    return { ok: false, data: { error: { message: 'Failed to fetch audit data' } } };
  }
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

async function postReplenishment(body: Record<string, unknown>) {
  const res = await fetch("/api/replenishment-demo", {
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

async function runSeed() {
  const res = await fetch("/api/demo-seed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Trace-Id": safeId(),
      "Idempotency-Key": safeId(),
    },
    body: JSON.stringify({}),
  });
  const data = await res.json();
  return { ok: res.ok && data?.ok, data };
}

async function fetchAuditByAction(action: string, limit = 5) {
  const p = new URLSearchParams({ limit: String(limit), offset: "0" });
  // server filters may not support 'action' param; we filter client-side for safety
  const r = await fetch(`/api/audit?${p.toString()}`);
  const j = await r.json();
  const items = Array.isArray(j?.items) ? j.items : [];
  return items.filter((it: any) => it?.action === action);
}

function setRoleCookie(v: string) {
  document.cookie = `x-role=${encodeURIComponent(v)}; path=/; max-age=31536000`;
  location.reload();
}


export default function DashboardPage() {
  // role
  const role = getRoleFromCookie();
  const canAct = role === "ADMIN" || role === "FM";

  // toast
  const toast = useToast();

  // keyboard shortcuts
  useHotkeys([
    { combo: "R",     handler: (e) => { e.preventDefault(); refreshAudit?.(); toast({ kind:"ok", text:"Audit refreshed" }); } },
    { combo: "E",     handler: (e) => { e.preventDefault(); (window as any).__loadEvents?.(); toast({ kind:"ok", text:"Events refreshed" }); } },
    { combo: "F",     handler: (e) => { e.preventDefault(); runForecast?.(); } },
    { combo: "C",     handler: (e) => { e.preventDefault(); createReplDraft?.(); } },
    { combo: "P",     handler: (e) => { e.preventDefault(); if (targetId) act("request"); } },
    { combo: "G",     handler: (e) => { e.preventDefault(); if (canAct && targetId) act("grant"); } },
    { combo: "D",     handler: (e) => { e.preventDefault(); if (canAct && targetId) act("deny"); } },
  ], true);

  // approvals state
  const [targetId, setTargetId] = useState("sample-approval-1");
  const [statusMsg, setStatusMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [working, setWorking] = useState<null | "request" | "grant" | "deny">(null);

  // confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmKind, setConfirmKind] = useState<null | "grant" | "deny">(null);

  // reset dialog state
  const [resetOpen, setResetOpen] = useState(false);

  // audit state
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Audit filter
  const [auditQuery, setAuditQuery] = useState("");
  const auditQ = useDebouncedValue(auditQuery, 250);

  // Audit pagination state
  const [auPage, setAuPage] = useState(0);
  const [auPageSize, setAuPageSize] = useState(25);
  useEffect(() => { setAuPage(0); }, [auditQ]);
  const auTotal = auditRows.filter(e => {
    const text = JSON.stringify(e).toLowerCase();
    return text.includes(auditQ.toLowerCase());
  }).length;
  const auSlice = auditRows.filter(e => {
    const text = JSON.stringify(e).toLowerCase();
    return text.includes(auditQ.toLowerCase());
  }).slice(auPage * auPageSize, auPage * auPageSize + auPageSize);

  // forecast state
  const [fcstId, setFcstId] = useState<string>("");
  const [fcstBusy, setFcstBusy] = useState(false);
  const [fcstMsg, setFcstMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // replenishment state
  const [replId, setReplId] = useState<string>("");
  const [replBusy, setReplBusy] = useState(false);
  const [replMsg, setReplMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // seed state
  const [seedBusy, setSeedBusy] = useState(false);

  // events monitor state
  const [evRows, setEvRows] = useState<{ name: string; ts: number; payload: unknown }[]>([]);
  const [evBusy, setEvBusy] = useState(false);
  const [evError, setEvError] = useState<string | null>(null);

  // auto-scroll events state
  const [autoScrollEvents, setAutoScrollEvents] = useState<boolean>(() => {
    try { return localStorage.getItem("autoScrollEvents") !== "false"; } catch { return true; }
  });

  // ref for the scroll container around the Events table
  const evScrollRef = useRef<HTMLDivElement | null>(null);

  // Events filter
  const [evQuery, setEvQuery] = useState("");
  const evQ = useDebouncedValue(evQuery, 250);

  // Events pagination state
  const [evPage, setEvPage] = useState(0);         // page index
  const [evPageSize, setEvPageSize] = useState(20);
  useEffect(() => { setEvPage(0); }, [evQ]);       // reset when filter changes
  const evTotal = evRows.filter(e => {
    const text = JSON.stringify(e).toLowerCase();
    return text.includes(evQ.toLowerCase());
  }).length;
  const evSlice = evRows.filter(e => {
    const text = JSON.stringify(e).toLowerCase();
    return text.includes(evQ.toLowerCase());
  }).slice(evPage * evPageSize, evPage * evPageSize + evPageSize);

  // history state
  const [fcstHist, setFcstHist] = useState<any[]>([]);
  const [replHist, setReplHist] = useState<any[]>([]);

  // health state
  const [health, setHealth] = useState<any>(null);
  const [healthError, setHealthError] = useState<string | null>(null);

  // dev notifications state
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  // failures state
  const [failRows, setFailRows] = useState<any[]>([]);

  // settings state
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchKind, setBatchKind] = useState<null | "request" | "grant" | "deny">(null);
  const [pollMs, setPollMs] = useState<number>(() => Number(localStorage.getItem("pollMs") || 2000));

  // timestamp format state
  const [useRelative, setUseRelative] = useState(false);

  // layout preference state
  const [layoutPref, setLayoutPref] = useLayoutPref();

  // payload column width state
  const [payloadW, setPayloadW] = useState<string>(() => {
    try { return localStorage.getItem("payloadW") || "50%"; } catch { return "50%"; }
  });

  // soft reset function
  function softReset() {
    try {
      // clear client-side prefs/filters
      localStorage.removeItem("pollMs");
      localStorage.removeItem("theme");
      // clear dashboard filters
      setEvQuery("");
      setAuditQuery("");
      // remove dark class
      document.body.classList.remove("dark");
    } catch {}
    // reload data and UI
    try { (window as any).__refreshAudit?.(); } catch {}
    try { (window as any).__loadEvents?.(); } catch {}
  }

  // share snapshot function
  function shareSnapshot() {
    try {
      const role = (typeof document !== "undefined" && document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/)) ? decodeURIComponent(RegExp.$1) : "ANON";
      const theme = (typeof localStorage !== "undefined" ? localStorage.getItem("theme") : null) || (document.body.classList.contains("dark") ? "dark" : "light");
      const pollMs = typeof localStorage !== "undefined" ? Number(localStorage.getItem("pollMs") || 2000) : 2000;

      // Gather the current, already filtered rows if those variables exist:
      const snapshot = {
        meta: {
          createdAt: new Date().toISOString(),
          id: safeId(),
        },
        actor: { role },
        settings: { theme, pollMs },
        inputs: { targetId }, // existing state
        counts: {
          audit: auTotal,
          events: evTotal,
          failures: failRows.length,
        },
        // rows (trim to avoid huge files)
        audit: auSlice.slice(0, 200),
        events: evSlice.slice(0, 200),
        failures: failRows.slice(0, 100),
      };
      downloadJson(`dashboard-snapshot-${snapshot.meta.id}.json`, snapshot);
    } catch (e) {
      // no-op: snapshot is best-effort
    }
  }

  const auditParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("limit", "10");
    p.set("offset", "0");
    return p;
  }, []);

  // helper to normalize IDs from the input targetId
  const batchIds = useMemo(() => {
    return String(targetId || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 50); // safety cap
  }, [targetId]);

  // persist pollMs to localStorage
  useEffect(() => { localStorage.setItem("pollMs", String(pollMs)); }, [pollMs]);

  // persist layoutPref to localStorage
  useEffect(() => { localStorage.setItem("layoutPref", layoutPref); }, [layoutPref]);

  // persist autoScrollEvents to localStorage
  useEffect(() => {
    try { localStorage.setItem("autoScrollEvents", String(autoScrollEvents)); } catch {}
  }, [autoScrollEvents]);

  // persist payloadW to localStorage and apply CSS variable
  useEffect(() => {
    try { localStorage.setItem("payloadW", payloadW); } catch {}
    try { document.documentElement.style.setProperty("--payload-col-w", payloadW); } catch {}
  }, [payloadW]);

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

  async function loadEvents() {
    setEvBusy(true);
    setEvError(null);
    try {
      const r = await fetch("/api/dev-events?limit=20&offset=0");
      const j = await r.json();
      if (j?.ok) {
        setEvRows(Array.isArray(j.items) ? j.items : []);
        // auto-scroll to newest rows (top) if enabled
        if (autoScrollEvents && evScrollRef.current) {
          evScrollRef.current.scrollTop = 0;
        }
      } else {
        setEvError("Could not load events. Please try again.");
        setEvRows([]);
      }
    } catch {
      setEvError("Could not load events. Please try again.");
      setEvRows([]);
    } finally { 
      setEvBusy(false); 
    }
  }

  async function fetchHealth() {
    setHealthError(null);
    try {
      const r = await fetch("/api/health");
      const j = await r.json();
      setHealth(j);
    } catch { 
      setHealth(null);
      setHealthError("Could not load health data. Please try again.");
    }
  }

  // Handle command palette actions
  useEffect(() => {
    const handleCommandAction = (e: CustomEvent) => {
      const { commandId } = e.detail;
      
      switch (commandId) {
        case 'action-refresh':
          refreshAudit();
          loadEvents();
          break;
        case 'action-export':
          // Trigger export functionality
          if (evRows && evRows.length > 0) {
            downloadJson('events.json', evRows);
          }
          break;
        case 'action-clear-filters':
          setEvQuery('');
          setAuditQuery('');
          break;
        case 'action-toggle-theme':
          toggleDark();
          break;
        case 'action-start-tour':
          localStorage.removeItem('tourSeen');
          window.location.reload();
          break;
        case 'action-shortcuts':
          setShortcutsOpen(true);
          break;
        case 'action-about':
          setAboutOpen(true);
          break;
      }
    };

    window.addEventListener('command-palette-action', handleCommandAction as EventListener);
    return () => window.removeEventListener('command-palette-action', handleCommandAction as EventListener);
  }, [evRows, auditQ, evQ]);

  useEffect(() => {
    refreshAudit();
    // Expose refreshAudit to window for forecast card to use
    (window as any).__refreshAudit = refreshAudit;
    // Expose loadEvents to window for keyboard shortcuts
    (window as any).__loadEvents = loadEvents;
    // Load events and set up polling
    loadEvents();
    const id = setInterval(loadEvents, pollMs);
    // Load history data
    (async () => {
      try {
        setFcstHist(await fetchAuditByAction("ForecastRunCompleted", 5));
        setReplHist(await fetchAuditByAction("ReplenishmentDraftCreated", 5));
      } catch {}
    })();
    // Load health data
    fetchHealth();
    
    // Dev notifications polling
    async function pollLastEvent() {
      try {
        const r = await fetch("/api/dev-events?limit=1&offset=0");
        const j = await r.json();
        if (j?.items?.[0]) {
          setLastEvent(`${j.items[0].name} at ${new Date(j.items[0].ts).toLocaleTimeString()}`);
        }
      } catch {}
    }
    pollLastEvent();
    const eventId = setInterval(pollLastEvent, 5000);
    
    return () => {
      clearInterval(id);
      clearInterval(eventId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function act(action: "request" | "grant" | "deny") {
    setWorking(action);
    setStatusMsg(null);
    const { ok, data } = await postApproval(action, { targetId, actionAt: Date.now() });
    if (ok) {
      setStatusMsg({ kind: "ok", text: `Success: ${action}` });
      toast({ kind: "ok", text: `Approval ${action === "request" ? "requested" : action === "grant" ? "granted" : "denied"}.` });
      refreshAudit();
    } else {
      const msg = (data as ApiError)?.error?.message || "Operation failed";
      setStatusMsg({ kind: "err", text: msg });
      toast({ kind: "err", text: `Couldn't ${action === "request" ? "request approval" : action === "grant" ? "approve" : "deny"}.` });
    }
    setWorking(null);
  }

  async function actOne(kind: "request" | "grant" | "deny", id: string) {
    const res = await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Trace-Id": safeId(), "Idempotency-Key": safeId() },
      body: JSON.stringify({ action: kind, targetId: id, actionAt: Date.now() }),
    });
    const j = await res.json().catch(() => ({}));
    return { ok: res.ok && j?.ok };
  }

  async function actBatch(kind: "request" | "grant" | "deny") {
    if (batchIds.length === 0) return;
    setWorking(kind);
    setStatusMsg(null);
    let okCount = 0;
    for (const id of batchIds) {
      const r = await actOne(kind, id);
      okCount += r.ok ? 1 : 0;
    }
    setWorking(null);
    toast({ kind: "ok", text: `${kind} ${okCount}/${batchIds.length} done` });
    try { await refreshAudit(); } catch {}
  }

  async function runForecast() {
    setFcstBusy(true);
    setFcstMsg(null);
    const id = `fcst-${Date.now()}`;
    setFcstId(id);
    const { ok, data } = await postForecast({ id, params: { horizonDays: 7, items: 5 }, delayMs: 1000 });
    if (ok) {
      setFcstMsg({ kind: "ok", text: `Forecast completed: ${id}` });
      toast({ kind: "ok", text: "Forecast completed." });
      // Refresh audit to show the new forecast events
      try { (window as any).__refreshAudit?.(); } catch {}
    } else {
      const msg = data?.error?.message || "Forecast failed";
      setFcstMsg({ kind: "err", text: msg });
      toast({ kind: "err", text: "Couldn't start forecast." });
    }
    setFcstBusy(false);
  }

  async function createReplDraft() {
    setReplBusy(true);
    setReplMsg(null);
    const draftId = `repl-${Date.now()}`;
    setReplId(draftId);
    const { ok, data } = await postReplenishment({
      draftId,
      items: [
        { sku: "SKU-1001", qty: 12 },
        { sku: "SKU-1002", qty: 8  },
        { sku: "SKU-1003", qty: 5  },
      ],
      delayMs: 500,
    });
    if (ok) {
      setReplMsg({ kind: "ok", text: `Draft created: ${draftId}` });
      toast({ kind: "ok", text: "Draft created." });
      try { (window as any).__refreshAudit?.(); } catch {}
    } else {
      const msg = data?.error?.message || "Failed to create draft";
      setReplMsg({ kind: "err", text: msg });
      toast({ kind: "err", text: "Couldn't create draft." });
    }
    setReplBusy(false);
  }

  return (
    <main id="main" className={`container mx-auto px-4 py-6 ${layoutPref === "grid" ? "grid grid-cols-1 lg:grid-cols-2 gap-4" : "space-y-4"}`}>
      <DemoTour />
      <div className="flex items-center justify-between mb-4">
        <StatusBar eventCount={(evRows || []).length} />
        <NotificationBell />
      </div>
      
      {/* KPI Mini-Widgets */}
      {(() => {
        const { effectiveRole } = useRole();
        const kpis = getKpisForRole(effectiveRole as any);
        
        if (kpis.length === 0) return null;
        
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {kpis.map((kpi) => (
              <KpiMini key={kpi.metricId} kpi={kpi} />
            ))}
          </div>
        );
      })()}
      
      {/* Dev Notifications Banner */}
      {lastEvent && (
        <div className="rounded bg-indigo-600 text-white px-3 py-2 text-sm shadow">
          Last Event: {lastEvent}
        </div>
      )}

      {/* User Profile */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            <div><b>Role:</b> {role}</div>
            <div><b>Version:</b> {APP_VERSION}</div>
          </div>
          <Toolbar>
            <Button onClick={toggleDark} variant="outline">Toggle Dark Mode</Button>
            <Button variant="outline" onClick={() => setSettingsOpen(true)}>Settings</Button>
            <Button variant="outline" onClick={() => setAboutOpen(true)}>About</Button>
            <Button variant="outline" onClick={() => { localStorage.removeItem("tourSeen"); location.reload(); }}>
              Start Tour
            </Button>
            <Button variant="outline" onClick={() => setShortcutsOpen(true)}>Shortcuts</Button>
            <Button variant="outline" onClick={() => window.open('/docs', '_blank')}>Docs</Button>
            <Tooltip label="Search commands (⌘K)">
              <Button variant="outline" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}>
                Search
              </Button>
            </Tooltip>
            <Button variant="outline" onClick={() => window.print()}>Print</Button>
            <Button variant="outline" onClick={shareSnapshot}>Share Snapshot</Button>
            <Button variant="outline" onClick={() => setResetOpen(true)}>Reset Dashboard</Button>
            <Button variant="outline" onClick={async () => { setSeedBusy(true); const { ok } = await runSeed(); setSeedBusy(false); if (ok) { toast({ kind: "ok", text: "Demo data seeded" }); (window as any).__refreshAudit?.(); (window as any).__loadEvents?.(); } else { toast({ kind:"err", text: "Seeding failed" }); } }}>
              {seedBusy ? "Seeding…" : "Seed Demo Data"}
            </Button>
            <Button variant="outline" onClick={async () => {
              try {
                const r = await fetch("/api/dev-events/clear", { method: "POST" });
                const j = await r.json();
                if (j?.ok) {
                  (window as any).__loadEvents?.();
                  toast({ kind: "ok", text: "Events cleared" });
                } else {
                  toast({ kind: "err", text: "Could not clear events" });
                }
              } catch {
                toast({ kind: "err", text: "Could not clear events" });
              }
            }}>
              Clear Events
            </Button>
            <select className="border rounded px-2 py-1 text-xs"
                    value={layoutPref}
                    onChange={(e)=>setLayoutPref(e.target.value as "grid" | "stack")}>
              <option value="stack">Stack layout</option>
              <option value="grid">Grid layout</option>
            </select>
          </Toolbar>
          <label className="text-xs flex items-center gap-1">
            <input type="checkbox" checked={useRelative} onChange={(e)=>setUseRelative(e.target.checked)} />
            Relative time
          </label>
        </CardContent>
      </Card>

      {/* Quick Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Approvals (Demo)</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Role: {role}</span>
            <div className="flex items-center gap-1 text-xs">
              <span className="text-gray-500">Quick Role:</span>
              <Button className="px-2 py-1 text-xs" onClick={() => setRoleCookie("ANON")}>ANON</Button>
              <Button className="px-2 py-1 text-xs" onClick={() => setRoleCookie("FM")}>FM</Button>
              <Button className="px-2 py-1 text-xs" onClick={() => setRoleCookie("ADMIN")}>ADMIN</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>

        <div className="flex flex-col sm:flex-row gap-3">
          <Tooltip label="Type an ID for approval actions">
            <input
              className="border rounded px-3 py-2 w-full sm:w-80"
              placeholder="Target ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
            />
          </Tooltip>
          <div className="flex gap-2">
            <Tooltip label="Request approval for the target ID">
              <Button
                onClick={() => {
                  if (batchIds.length > 1) { setBatchKind("request"); setBatchConfirmOpen(true); }
                  else act("request");
                }}
                disabled={working !== null || !targetId}
                aria-label="Request approval"
              >
                {working === "request" ? "Requesting…" : "Request"}
              </Button>
            </Tooltip>
            {canAct && (
              <>
                <Tooltip label="Grant approval for the target ID">
                  <Button
                    onClick={() => {
                      if (batchIds.length > 1) { setBatchKind("grant"); setBatchConfirmOpen(true); }
                      else { setConfirmKind("grant"); setConfirmOpen(true); }
                    }}
                    disabled={working !== null || !targetId}
                    variant="success"
                    aria-label="Approve target"
                  >
                    {working === "grant" ? "Granting…" : "Approve"}
                  </Button>
                </Tooltip>
                <Tooltip label="Deny approval for the target ID">
                  <Button
                    onClick={() => {
                      if (batchIds.length > 1) { setBatchKind("deny"); setBatchConfirmOpen(true); }
                      else { setConfirmKind("deny"); setConfirmOpen(true); }
                    }}
                    disabled={working !== null || !targetId}
                    variant="danger"
                    aria-label="Deny target"
                  >
                    {working === "deny" ? "Denying…" : "Deny"}
                  </Button>
                </Tooltip>
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
          <div className="mt-1 text-xs text-gray-500">Tip: Separate multiple IDs with commas to run batch actions.</div>
        </CardContent>
      </Card>

      {/* Forecast Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Forecasts (Demo)</CardTitle>
          {fcstId ? <span className="text-xs text-gray-500">Last run: {fcstId}</span> : null}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Tooltip label="Start a demo forecast run">
              <Button
                onClick={runForecast}
                disabled={fcstBusy}
                aria-label="Run forecast demo"
              >
                {fcstBusy ? "Running…" : "Start Forecast"}
              </Button>
            </Tooltip>
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
        </CardContent>
      </Card>

      {/* Replenishment Draft Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Replenishments (Demo)</CardTitle>
          {replId ? <span className="text-xs text-gray-500">Last draft: {replId}</span> : null}
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Tooltip label="Create a replenishment draft and emit event">
              <Button
                onClick={createReplDraft}
                disabled={replBusy}
                variant="success"
                aria-label="Create replenishment draft"
              >
                {replBusy ? "Creating…" : "Create Draft"}
              </Button>
            </Tooltip>
            <span className="text-xs text-gray-600">Emits ReplenishmentDraftCreated</span>
          </div>
          {replMsg && (
            <div
              className={`mt-3 rounded border px-3 py-2 ${
                replMsg.kind === "ok" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {replMsg.text}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Monitor */}
      <Card>
        <CardContent>
          <DataTable
            title="Events (Dev Monitor)"
            data={evSlice}
            columns={[
              {
                key: "ts",
                label: "Time",
                render: (value: any, row: any) => {
                  const tsCell = useRelative ? useRelativeTime(row.ts ?? null) : (typeof row.ts === "number" ? new Date(row.ts).toISOString() : (row.ts || ""));
                  return tsCell;
                }
              },
              {
                key: "name",
                label: "Event"
              },
              {
                key: "payload",
                label: "Payload",
                render: (value: any) => <CollapsibleJson obj={value ?? {}} />
              }
            ]}
            onRefresh={loadEvents}
            onClearFilters={() => setEvQuery("")}
            loading={evBusy}
            error={evError}
          >
            {/* Additional controls */}
            <div className="flex items-center gap-2 mb-4">
              <Tooltip label="Search through events by name, timestamp, or payload content">
                <input
                  className="border rounded px-2 py-1 text-sm w-48"
                  placeholder="Filter events…"
                  value={evQuery}
                  onChange={(e)=>setEvQuery(e.target.value)}
                  aria-label="Filter events"
                />
              </Tooltip>
              <label className="text-xs flex items-center gap-1">
                <input type="checkbox" checked={autoScrollEvents} onChange={(e)=>setAutoScrollEvents(e.target.checked)} />
                Auto-scroll
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Payload width</span>
                <select
                  className="border rounded px-2 py-1 text-xs"
                  value={payloadW}
                  onChange={(e)=>setPayloadW(e.target.value)}
                  aria-label="Payload column width"
                >
                  <option value="30%">30%</option>
                  <option value="50%">50%</option>
                  <option value="70%">70%</option>
                </select>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>{Math.min(evSlice.length, evPageSize)} / {evTotal}</span>
              <select className="border rounded px-2 py-1"
                      value={evPageSize} onChange={(e)=>{ setEvPageSize(Number(e.target.value)); setEvPage(0); }}>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <Button variant="outline" onClick={()=>setEvPage(0)}      disabled={evPage===0}>« First</Button>
              <Button variant="outline" onClick={()=>setEvPage(p=>Math.max(0,p-1))} disabled={evPage===0}>‹ Prev</Button>
              <span>Page {evPage+1} / {Math.max(1, Math.ceil(evTotal/evPageSize))}</span>
              <Button variant="outline" onClick={()=>setEvPage(p=>Math.min(p+1, Math.max(0, Math.ceil(evTotal/evPageSize)-1)))} disabled={(evPage+1)>=Math.ceil(evTotal/evPageSize)}>Next ›</Button>
              <Button variant="outline" onClick={()=>setEvPage(Math.max(0, Math.ceil(evTotal/evPageSize)-1))} disabled={(evPage+1)>=Math.ceil(evTotal/evPageSize)}>Last »</Button>
            </div>
          </DataTable>
        </CardContent>
      </Card>

      {/* Recent Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          {fcstHist.length === 0 ? (
            <div className="rounded border px-3 py-2 empty-state">No completed forecasts. Use 'Start Forecast' above.</div>
          ) : (
            <ul className="list-disc pl-5">
              {fcstHist.map((e, i) => (
                <li key={i} className="mb-1">
                  <span className="text-xs text-gray-600">{new Date(e.ts).toLocaleString()}</span> —{" "}
                  <code className="text-xs">{JSON.stringify(e.payload?.result?.summary || e.payload || {})}</code>
          </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent Replenishments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Replenishments</CardTitle>
        </CardHeader>
        <CardContent>
          {replHist.length === 0 ? (
            <div className="rounded border px-3 py-2 empty-state">No drafts yet. Use 'Create Draft' above.</div>
          ) : (
            <ul className="list-disc pl-5">
              {replHist.map((e, i) => (
                <li key={i} className="mb-1">
                  <span className="text-xs text-gray-600">{new Date(e.ts).toLocaleString()}</span> —{" "}
                  <code className="text-xs">{JSON.stringify({ draftId: e.payload?.draftId, items: (e.payload?.items||[]).length })}</code>
          </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <Button onClick={fetchHealth} className="text-sm" aria-label="Refresh system health">Refresh</Button>
        </CardHeader>
        <CardContent>
          {healthError ? (
            <div className="rounded border px-3 py-2 bg-red-50 border-red-200 text-red-800">
              {healthError}
            </div>
          ) : health ? (
            <pre className="empty-state border rounded p-3 text-sm overflow-x-auto">{JSON.stringify(health, null, 2)}</pre>
          ) : (
            <div className="rounded border px-3 py-2 empty-state">No health data.</div>
          )}
        </CardContent>
      </Card>

      {/* Recent Audit */}
      <Card>
        <CardContent>
          <DataTable
            title="Recent Audit"
            data={auSlice}
            columns={[
              {
                key: "ts",
                label: "Time",
                render: (value: any, row: any) => {
                  const tsCell = useRelative ? useRelativeTime(row.ts ?? null) : (typeof row.ts === "number" ? new Date(row.ts).toISOString() : (row.ts || ""));
                  return tsCell;
                }
              },
              {
                key: "actor",
                label: "Actor"
              },
              {
                key: "actorRole",
                label: "Role"
              },
              {
                key: "action",
                label: "Action"
              },
              {
                key: "payload",
                label: "Payload",
                render: (value: any) => <CollapsibleJson obj={value ?? {}} />
              }
            ]}
            onRefresh={refreshAudit}
            onClearFilters={() => setAuditQuery("")}
            loading={loadingAudit}
            error={auditError}
          >
            {/* Additional controls */}
            <div className="flex items-center gap-2 mb-4">
              <Tooltip label="Search through audit entries by actor, role, action, or payload content">
                <input
                  className="border rounded px-2 py-1 text-sm w-56"
                  placeholder="Filter audit…"
                  value={auditQuery}
                  onChange={(e)=>setAuditQuery(e.target.value)}
                  aria-label="Filter audit"
                />
              </Tooltip>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Payload width</span>
                <select
                  className="border rounded px-2 py-1 text-xs"
                  value={payloadW}
                  onChange={(e)=>setPayloadW(e.target.value)}
                  aria-label="Payload column width"
                >
                  <option value="30%">30%</option>
                  <option value="50%">50%</option>
                  <option value="70%">70%</option>
                </select>
              </div>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>{Math.min(auSlice.length, auPageSize)} / {auTotal}</span>
              <select className="border rounded px-2 py-1"
                      value={auPageSize} onChange={(e)=>{ setAuPageSize(Number(e.target.value)); setAuPage(0); }}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <Button variant="outline" onClick={()=>setAuPage(0)}      disabled={auPage===0}>« First</Button>
              <Button variant="outline" onClick={()=>setAuPage(p=>Math.max(0,p-1))} disabled={auPage===0}>‹ Prev</Button>
              <span>Page {auPage+1} / {Math.max(1, Math.ceil(auTotal/auPageSize))}</span>
              <Button variant="outline" onClick={()=>setAuPage(p=>Math.min(p+1, Math.max(0, Math.ceil(auTotal/auPageSize)-1)))} disabled={(auPage+1)>=Math.ceil(auTotal/auPageSize)}>Next ›</Button>
              <Button variant="outline" onClick={()=>setAuPage(Math.max(0, Math.ceil(auTotal/auPageSize)-1))} disabled={(auPage+1)>=Math.ceil(auTotal/auPageSize)}>Last »</Button>
            </div>
          </DataTable>
        </CardContent>
      </Card>

      {/* Acceptance Test Panel - Development Only */}
      <AcceptancePanel />

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500">
        Shortcuts: <code>R</code> refresh audit • <code>E</code> refresh events • <code>F</code> start forecast • <code>C</code> create draft •
        <code>P</code> request • <code>G</code> approve • <code>D</code> deny
      </div>

      {/* Settings Modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <label htmlFor="poll">Events Poll Interval (ms)</label>
            <input 
              id="poll" 
              type="number" 
              className="border rounded px-2 py-1 w-28"
              value={pollMs} 
              min={500} 
              step={100}
              onChange={(e) => setPollMs(Math.max(500, Number(e.target.value || 2000)))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>Theme</div>
            <Button variant="outline" onClick={toggleDark}>Toggle Dark</Button>
          </div>
          <div className="text-xs text-gray-500">Settings are stored locally in your browser.</div>
        </div>
      </Modal>

      {/* About Modal */}
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* Shortcuts Modal */}
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title={confirmKind === "grant" ? "Confirm Approval" : "Confirm Denial"}
        message={
          <div>
            Are you sure you want to <b>{confirmKind === "grant" ? "approve" : "deny"}</b> target
            <code className="ml-1">{targetId}</code>?
          </div>
        }
        confirmText={confirmKind === "grant" ? "Approve" : "Deny"}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          if (!confirmKind) return;
          await act(confirmKind); // uses existing handler
        }}
      />

      {/* Batch Confirm Dialog */}
      <ConfirmDialog
        open={batchConfirmOpen}
        title="Run batch approvals?"
        message={<div>Action: <b>{batchKind}</b><br/>Targets: {batchIds.map((x,i)=> <code key={i} className="mr-1">{x}</code>)}</div>}
        confirmText="Run batch"
        onCancel={() => setBatchConfirmOpen(false)}
        onConfirm={async () => {
          setBatchConfirmOpen(false);
          if (!batchKind) return;
          await actBatch(batchKind);
        }}
      />

      {/* Reset Confirm Dialog */}
      <ConfirmDialog
        open={resetOpen}
        title="Reset Dashboard"
        message="This will clear local settings (poll interval, theme) and filters, then reload data."
        confirmText="Reset"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => { setResetOpen(false); softReset(); }}
      />
      
      {/* Toast Notifications */}
      <ToastHost />
      </main>
  );
}