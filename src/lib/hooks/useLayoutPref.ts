"use client";
import { useState, useEffect } from "react";

export type LayoutPreference = "grid" | "stack";

/**
 * Hook for managing layout preference (grid vs stack)
 * Persists choice to localStorage
 */
export function useLayoutPref(): [LayoutPreference, (pref: LayoutPreference) => void] {
  const [layoutPref, setLayoutPref] = useState<LayoutPreference>(() => {
    try {
      const stored = localStorage.getItem("layoutPref");
      return (stored === "grid" || stored === "stack") ? stored : "stack";
    } catch {
      return "stack";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("layoutPref", layoutPref);
    } catch {
      // Silently fail if localStorage is not available
    }
  }, [layoutPref]);

  return [layoutPref, setLayoutPref];
}
