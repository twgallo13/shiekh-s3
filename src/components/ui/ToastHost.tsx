"use client";
import React, { createContext, useContext, useRef, useState } from "react";

type T = { id: string; kind: "ok"|"err"; text: string };
const Ctx = createContext<{ push: (t: Omit<T,"id">) => void } | null>(null);

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error("ToastHost missing");
  return v.push;
}

export default function ToastHost({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const timer = useRef<Record<string, any>>({});

  function push(t: Omit<T,"id">) {
    const id = `${Date.now()}-${Math.random()}`;
    setItems((prev) => [{ id, ...t }, ...prev].slice(0, 5));
    timer.current[id] = setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
      clearTimeout(timer.current[id]);
    }, 3500);
  }

  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {items.map(t => (
          <div key={t.id}
               className={`rounded border px-3 py-2 shadow text-sm ${t.kind==="ok" ? "bg-green-50 border-green-200 text-green-800":"bg-red-50 border-red-200 text-red-800"}`}>
            {t.text}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
