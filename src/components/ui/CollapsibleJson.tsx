"use client";
import React, { useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

export default function CollapsibleJson({ obj }: { obj: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border rounded bg-gray-50 p-2 text-xs">
      <div className="flex items-center justify-between mb-1">
        <button onClick={() => setOpen(o=>!o)} className="underline text-blue-600 text-xs">
          {open ? "Hide" : "Show"} JSON
        </button>
        <CopyButton getText={() => JSON.stringify(obj, null, 2)} label="Copy" />
      </div>
      {open && (
        <pre className="whitespace-pre-wrap break-words">{JSON.stringify(obj, null, 2)}</pre>
      )}
    </div>
  );
}
