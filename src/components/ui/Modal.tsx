"use client";
import React from "react";

export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-lg border bg-white p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button className="text-sm px-2 py-1 border rounded" onClick={onClose} aria-label="Close settings">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
