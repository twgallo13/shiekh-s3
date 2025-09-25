"use client";
import React, { useEffect } from "react";
import PerfHUD, { usePerfHUD } from "@/components/dev/PerfHUD";

/**
 * PerfHUD Provider - Development Only
 * Provides keyboard shortcut (Alt+Shift+P) and tiny header button for PerfHUD
 */
export default function PerfHUDProvider({ children }: { children: React.ReactNode }) {
  const { isVisible, togglePerfHUD } = usePerfHUD();

  // Only initialize in development
  if (process.env.NODE_ENV !== "development") {
    return <>{children}</>;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+Shift+P to toggle PerfHUD
      if (e.altKey && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        togglePerfHUD();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [togglePerfHUD]);

  return (
    <>
      {children}
      
      {/* Tiny header button */}
      <button
        onClick={togglePerfHUD}
        className="fixed top-2 right-2 z-40 w-6 h-6 bg-gray-800 text-white text-xs rounded-full hover:bg-gray-700 transition-colors"
        title="Toggle Performance HUD (Alt+Shift+P)"
        aria-label="Toggle Performance HUD"
      >
        P
      </button>

      {/* PerfHUD Component */}
      {isVisible && <PerfHUD onClose={togglePerfHUD} />}
    </>
  );
}
