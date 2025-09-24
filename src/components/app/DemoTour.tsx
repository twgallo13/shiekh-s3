"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

const steps = [
  { title: "Welcome", body: "This dashboard showcases approvals, forecasts, replenishments, audit logs, and dev events." },
  { title: "Approvals", body: "Use Quick Approvals to Request/Approve/Deny (ADMIN/FM). Try comma-separated IDs for batch." },
  { title: "Forecasts & Replenishments", body: "Run demo actions to emit events and see them appear in Events and Audit." },
  { title: "Events & Audit", body: "Monitor live events, filter/search, paginate, export JSON/CSV, copy payloads, and print." },
  { title: "Toolbar & Settings", body: "Toggle theme, change poll interval, reset dashboard, seed demo data, and share snapshots." },
];

export default function DemoTour() {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    try {
      const seen = localStorage.getItem("tourSeen");
      if (!seen) setOpen(true);
    } catch {}
  }, []);

  function next() {
    if (i + 1 < steps.length) setI(i + 1);
    else finish();
  }
  function back() { if (i > 0) setI(i - 1); }
  function finish() {
    setOpen(false);
    try { localStorage.setItem("tourSeen", "1"); } catch {}
  }

  if (!open) return null;
  const s = steps[i];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={finish} />
      <div className="relative w-full max-w-lg rounded-lg border bg-white p-5 shadow-lg">
        <div className="mb-3">
          <h3 className="text-lg font-semibold">{s.title}</h3>
          <div className="text-sm text-gray-700 mt-1">{s.body}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Step {i + 1} / {steps.length}</span>
          <button className="underline" onClick={finish}>Skip</button>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={back} disabled={i===0}>Back</Button>
          <Button onClick={next}>{i+1<steps.length ? "Next" : "Finish"}</Button>
        </div>
      </div>
    </div>
  );
}
