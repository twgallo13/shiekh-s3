export type DevEvent = { name: string; payload: unknown; ts: number };
const MAX = 200;
const buf: DevEvent[] = [];
export function pushDevEvent(e: DevEvent) { buf.unshift(e); if (buf.length > MAX) buf.pop(); }
export function readDevEvents(limit = 50, offset = 0) {
  const l = Math.max(1, Math.min(100, limit)); const o = Math.max(0, offset);
  return { totalCount: buf.length, items: buf.slice(o, o + l) };
}
export function clearDevEvents() { buf.length = 0; }
