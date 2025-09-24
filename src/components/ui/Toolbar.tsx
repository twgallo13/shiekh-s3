"use client";
import React from "react";
export default function Toolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {children}
    </div>
  );
}
