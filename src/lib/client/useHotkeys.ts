"use client";
import { useEffect } from "react";

type Keybind = { combo: string; handler: (e: KeyboardEvent) => void };

export default function useHotkeys(binds: Keybind[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const norm = (e: KeyboardEvent) => {
      const parts = [
        e.ctrlKey ? "Ctrl" : "",
        e.shiftKey ? "Shift" : "",
        e.altKey ? "Alt" : "",
        e.metaKey ? "Meta" : "",
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ].filter(Boolean).join("+");
      for (const b of binds) {
        if (b.combo.toLowerCase() === parts.toLowerCase()) {
          b.handler(e);
          break;
        }
      }
    };
    window.addEventListener("keydown", norm);
    return () => window.removeEventListener("keydown", norm);
  }, [JSON.stringify(binds), enabled]);
}
