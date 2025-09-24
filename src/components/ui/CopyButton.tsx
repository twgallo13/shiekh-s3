"use client";
import React, { useState } from "react";
import { useToast } from "@/components/ui/ToastHost";

export default function CopyButton({ getText, label = "Copy" }: { getText: () => string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  
  async function copy() {
    setBusy(true);
    const txt = getText();
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(txt);
      } else {
        const ta = document.createElement("textarea");
        ta.value = txt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({ kind: "ok", text: "Copied" });
    } catch {
      toast({ kind: "err", text: "Copy failed" });
    } finally {
      setBusy(false);
    }
  }
  
  return (
    <button onClick={copy} disabled={busy} className="px-2 py-1 border rounded text-xs">
      {busy ? "…" : label}
    </button>
  );
}
