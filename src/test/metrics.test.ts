import { describe, it, expect, beforeEach } from 'vitest';

import * as metrics from '@/lib/metrics';

describe('Metrics', () => {
  beforeEach(() => {
    // Reset metrics state by importing fresh module
    // This is a simple approach for testing in-memory state
  });

  it('should track hits and errors', () => {
    const initialSnapshot = metrics.snapshot();
    
    metrics.incHits();
    metrics.incHits();
    metrics.incErrors();
    
    const snapshot = metrics.snapshot();
    
    expect(snapshot.hits).toBe(initialSnapshot.hits + 2);
    expect(snapshot.errors).toBe(initialSnapshot.errors + 1);
  });

  it('should track timers', () => {
    metrics.startTimer('test-timer');
    
    const snapshot = metrics.snapshot();
    expect(snapshot.activeTimers).toContain('test-timer');
    
    metrics.stopTimer('test-timer');
    
    const finalSnapshot = metrics.snapshot();
    expect(finalSnapshot.activeTimers).not.toContain('test-timer');
  });

  it('should handle stopping non-existent timer', () => {
    // Should not throw
    metrics.stopTimer('non-existent-timer');
    
    const snapshot = metrics.snapshot();
    expect(snapshot.activeTimers).toEqual(expect.any(Array));
  });
});
