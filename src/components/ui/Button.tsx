"use client";
import React from "react";

type Variant = "primary" | "success" | "danger" | "outline";
export function Button({
  children, onClick, disabled, className = "", variant = "primary", type = "button",
}: React.PropsWithChildren<{ onClick?: () => void; disabled?: boolean; className?: string; variant?: Variant; type?: "button"|"submit" }>) {
  const base = "px-3 py-2 rounded text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const styles: Record<Variant, string> = {
    primary: "bg-[var(--color-primary)] text-white hover:bg-indigo-700",
    success: "bg-[var(--color-success)] text-white hover:bg-emerald-700",
    danger:  "bg-[var(--color-danger)]  text-white hover:bg-red-700",
    outline: "border bg-white hover:bg-gray-50",
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}
