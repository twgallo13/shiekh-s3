"use client";
import { useEffect, useState } from "react";

export default function useRelativeTime(ts: number | string | null, refreshMs = 60000) {
  const [text, setText] = useState<string>("");
  useEffect(() => {
    if (!ts) return;
    function update() {
      const date = typeof ts === "number" ? new Date(ts) : new Date(String(ts));
      const diff = Date.now() - date.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 1) setText("just now");
      else if (mins < 60) setText(`${mins}m ago`);
      else if (mins < 1440) setText(`${Math.floor(mins / 60)}h ago`);
      else setText(`${Math.floor(mins / 1440)}d ago`);
    }
    update();
    const id = setInterval(update, refreshMs);
    return () => clearInterval(id);
  }, [ts, refreshMs]);
  return text;
}
