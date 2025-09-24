"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function AuditDetailPage() {
  const { id } = useParams() as { id: string };
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/audit?id=${encodeURIComponent(id)}`);
        const j = await r.json();
        if (j?.ok) setEntry(j.item || null);
      } catch {}
    })();
  }, [id]);

  if (!entry) return <div className="p-4">Loading audit entry…</div>;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">Audit Entry {entry.id}</h1>
      <pre className="rounded border bg-gray-50 p-3 text-sm overflow-x-auto">
        {JSON.stringify(entry, null, 2)}
      </pre>
    </div>
  );
}
