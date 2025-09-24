"use client";
import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-lg border bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}
export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between mb-3">{children}</div>;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-lg font-semibold">{children}</h2>;
}
export function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
