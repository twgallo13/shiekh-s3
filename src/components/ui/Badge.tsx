"use client";
export function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-block text-xs px-2 py-0.5 rounded bg-gray-100 border">{children}</span>;
}
