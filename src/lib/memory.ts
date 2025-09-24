// Memory module - empty for now as specified in v0.1.0
// This will be implemented in v0.3.0 for manager chat memory

export interface MemoryEntry {
  id: string;
  userId?: string;
  role: string;
  key: string;
  value: Record<string, unknown>;
  pinned: boolean;
  createdAt: Date;
  expiresAt?: Date;
}

// Placeholder functions - will be implemented in v0.3.0
export async function upsertMemory(_params: {
  role: string;
  key: string;
  value: Record<string, unknown>;
  ttlHours?: number;
}): Promise<MemoryEntry> {
  throw new Error('Memory module not implemented yet - coming in v0.3.0');
}

export async function getMemories(_params: {
  role: string;
  keys?: string[];
}): Promise<MemoryEntry[]> {
  throw new Error('Memory module not implemented yet - coming in v0.3.0');
}

export async function pinMemory(_id: string, _pinned = true): Promise<void> {
  throw new Error('Memory module not implemented yet - coming in v0.3.0');
}

export async function garbageCollect(): Promise<void> {
  throw new Error('Memory module not implemented yet - coming in v0.3.0');
}
