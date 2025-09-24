let hits = 0;
let errors = 0;
const timers: Record<string, number> = {};

export function incHits() { hits += 1; }
export function incErrors() { errors += 1; }
export function startTimer(name: string) { timers[name] = Date.now(); }
export function stopTimer(name: string) { if (timers[name]) delete timers[name]; }
export function snapshot() { return { hits, errors, activeTimers: Object.keys(timers) }; }
