"use client";
import React, { useEffect, useState } from "react";
import useInterval from "@/lib/client/useInterval";
import { APP_VERSION } from "@/app/version";

function getRoleFromCookie(): string {
  if (typeof document === "undefined") return "ANON";
  const m = document.cookie.match(/(?:^|;\s*)x-role=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "ANON";
}

function toggleDark() {
  if (document.body.classList.contains("dark")) {
    document.body.classList.remove("dark");
    try { localStorage.setItem("theme", "light"); } catch {}
  } else {
    document.body.classList.add("dark");
    try { localStorage.setItem("theme", "dark"); } catch {}
  }
}

export default function StatusBar({ eventCount }: { eventCount: number }) {
  const [now, setNow] = useState<string>(() => new Date().toLocaleTimeString());
  const [role, setRole] = useState<string>(() => getRoleFromCookie());
  const [theme, setTheme] = useState<string>(() => (document.body.classList.contains("dark") ? "dark" : "light"));
  useInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
  useEffect(() => { setRole(getRoleFromCookie()); }, []);
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(document.body.classList.contains("dark") ? "dark" : "light"));
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  return (
    <div className="mb-3 text-xs flex flex-wrap items-center gap-3 text-gray-600">
      <span>🕒 {now}</span>
      <span>👤 {role}</span>
      <span>🏷️ {APP_VERSION}</span>
      <span>📡 events: {eventCount}</span>
      <button
        className="px-2 py-1 border rounded"
        onClick={() => { toggleDark(); setTheme(document.body.classList.contains("dark") ? "dark" : "light"); }}
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        Theme: {theme}
      </button>
    </div>
  );
}