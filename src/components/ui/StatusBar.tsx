"use client";
import React, { useEffect, useState } from "react";
import useInterval from "@/lib/client/useInterval";
import { APP_VERSION } from "@/app/version";
import { checkContrast, resolveTailwindColor } from "@/lib/utils/contrast";
import RoleSimSwitcher from "@/components/ui/RoleSimSwitcher";
import { useVersionHUD } from "@/components/dev/VersionHUD";

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
  const [hasLowContrast, setHasLowContrast] = useState<boolean>(false);
  
  // Version HUD hook
  const { openVersionHUD, VersionHUDComponent } = useVersionHUD();
  
  useInterval(() => setNow(new Date().toLocaleTimeString()), 1000);
  useEffect(() => { setRole(getRoleFromCookie()); }, []);
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(document.body.classList.contains("dark") ? "dark" : "light"));
    obs.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);
  
  // Dev-only contrast check
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const checkContrastForStatusBar = () => {
        try {
          // Check contrast between text-gray-600 and background
          const textColor = resolveTailwindColor("gray-600");
          const bgColor = theme === "dark" ? resolveTailwindColor("gray-900") : resolveTailwindColor("white");
          const contrastPasses = checkContrast(textColor, bgColor);
          setHasLowContrast(!contrastPasses);
        } catch (error) {
          // Silently fail if contrast check fails
          setHasLowContrast(false);
        }
      };
      
      checkContrastForStatusBar();
      // Re-check when theme changes
      const interval = setInterval(checkContrastForStatusBar, 1000);
      return () => clearInterval(interval);
    }
  }, [theme]);
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
      <RoleSimSwitcher />
      {process.env.NODE_ENV === "development" && hasLowContrast && (
        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 border border-yellow-300 rounded text-xs">
          ⚠ Low Contrast
        </span>
      )}
      {process.env.NODE_ENV === "development" && (
        <button
          className="px-2 py-1 border rounded hover:bg-gray-50 transition-colors"
          onClick={openVersionHUD}
          aria-label="Check version consistency"
          title="Checks version.ts ↔ CHANGELOG.md"
        >
          🔍 Version
        </button>
      )}
      {VersionHUDComponent}
    </div>
  );
}