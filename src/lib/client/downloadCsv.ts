"use client";
export default function downloadCsv(filename: string, rows: any[]) {
  const escape = (v: any) => {
    const s = typeof v === "string" ? v : JSON.stringify(v);
    const q = (s ?? "").replace(/"/g, '""');
    return `"${q}"`;
  };
  const cols = ["ts","actor","actorRole","action","name","payload"]; // union-friendly
  const header = cols.join(",");
  const lines = (rows || []).map((r) => {
    const ts = typeof r.ts === "number" ? new Date(r.ts).toISOString() : (r.ts ?? "");
    const actor = r.actor ?? "";
    const actorRole = r.actorRole ?? "";
    const action = r.action ?? "";
    const name = r.name ?? "";
    const payload = r.payload ?? r; // fallback
    return [ts, actor, actorRole, action, name, payload].map(escape).join(",");
  });
  const csv = [header, ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}
