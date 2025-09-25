/**
 * Zebra Performance HUD - Development Only
 * Lightweight performance monitoring using PerformanceObserver and performance.now()
 * Aligned to §14 budgets and DoD targets
 */

export interface PerfMetrics {
  tti: number | null; // Time to Interactive (ms)
  clientFetchP95: number | null; // Client data fetch p95 (ms)
  renderCommits: number; // React commit count
  droppedFrames: number; // Approximate dropped frames
  memoryEstimate: number | null; // Memory estimate (MB) if available
}

export interface PerfThresholds {
  tti: { pass: number; warn: number; fail: number };
  clientFetch: { pass: number; warn: number; fail: number };
  renderCommits: { pass: number; warn: number; fail: number };
  droppedFrames: { pass: number; warn: number; fail: number };
}

// §14 budgets and DoD targets
const THRESHOLDS: PerfThresholds = {
  tti: { pass: 100, warn: 150, fail: 200 }, // TTI ≤150ms target
  clientFetch: { pass: 200, warn: 300, fail: 500 }, // API p95 ≤300ms target
  renderCommits: { pass: 10, warn: 20, fail: 50 }, // React commits
  droppedFrames: { pass: 0, warn: 5, fail: 15 } // Dropped frames
};

class PerfHUDMonitor {
  private metrics: PerfMetrics = {
    tti: null,
    clientFetchP95: null,
    renderCommits: 0,
    droppedFrames: 0,
    memoryEstimate: null
  };

  private observers: PerformanceObserver[] = [];
  private isInitialized = false;
  private callbacks: ((metrics: PerfMetrics) => void)[] = [];

  // Client fetch timing samples
  private fetchSamples: number[] = [];
  private maxSamples = 50; // Keep last 50 samples for p95 calculation

  // React commit tracking
  private commitCount = 0;

  // Frame timing
  private lastFrameTime = 0;
  private frameDrops = 0;

  constructor() {
    // Only initialize in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }
  }

  /**
   * Initialize performance observers
   */
  startPerfHUD(): void {
    if (process.env.NODE_ENV !== "development" || this.isInitialized) {
      return;
    }

    this.isInitialized = true;
    this.initializeObservers();
    this.startFrameMonitoring();
    this.initializeMemoryMonitoring();
  }

  /**
   * Stop performance monitoring
   */
  stopPerfHUD(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }

  /**
   * Subscribe to metrics updates
   */
  onMetricsUpdate(callback: (metrics: PerfMetrics) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerfMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance thresholds
   */
  getThresholds(): PerfThresholds {
    return THRESHOLDS;
  }

  /**
   * Track client data fetch
   */
  trackClientFetch(duration: number): void {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    this.fetchSamples.push(duration);
    if (this.fetchSamples.length > this.maxSamples) {
      this.fetchSamples.shift();
    }

    // Calculate p95
    const sorted = [...this.fetchSamples].sort((a, b) => a - b);
    const p95Index = Math.ceil(sorted.length * 0.95) - 1;
    this.metrics.clientFetchP95 = sorted[p95Index] || 0;

    this.notifyCallbacks();
  }

  /**
   * Track React commit
   */
  trackReactCommit(): void {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    this.commitCount++;
    this.metrics.renderCommits = this.commitCount;
    this.notifyCallbacks();
  }

  private initializeObservers(): void {
    // Navigation timing for TTI
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              // TTI proxy: navigation start to load event end
              this.metrics.tti = navEntry.loadEventEnd - navEntry.navigationStart;
              this.notifyCallbacks();
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        console.warn('Failed to initialize navigation observer:', error);
      }

      // Long task observer for dropped frames
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'longtask') {
              this.frameDrops++;
              this.metrics.droppedFrames = this.frameDrops;
              this.notifyCallbacks();
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Failed to initialize long task observer:', error);
      }
    }
  }

  private startFrameMonitoring(): void {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let frameCount = 0;
    const targetFPS = 60;
    const targetFrameTime = 1000 / targetFPS;

    const checkFrame = (timestamp: number) => {
      if (this.lastFrameTime > 0) {
        const frameTime = timestamp - this.lastFrameTime;
        if (frameTime > targetFrameTime * 1.5) {
          // Frame took too long, likely dropped
          this.frameDrops++;
          this.metrics.droppedFrames = this.frameDrops;
          this.notifyCallbacks();
        }
      }
      this.lastFrameTime = timestamp;
      frameCount++;
      
      if (frameCount % 60 === 0) {
        // Check every 60 frames (roughly 1 second)
        this.notifyCallbacks();
      }
      
      requestAnimationFrame(checkFrame);
    };

    requestAnimationFrame(checkFrame);
  }

  private initializeMemoryMonitoring(): void {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Memory API is not widely supported, so we'll use a fallback
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.memoryEstimate = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        this.notifyCallbacks();
      }
    }

    // Fallback: estimate based on performance timing
    setTimeout(() => {
      if (this.metrics.memoryEstimate === null) {
        // Rough estimate based on page complexity
        const elements = document.querySelectorAll('*').length;
        this.metrics.memoryEstimate = Math.round(elements * 0.1); // Rough estimate
        this.notifyCallbacks();
      }
    }, 2000);
  }

  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => {
      try {
        callback(this.getMetrics());
      } catch (error) {
        console.warn('Error in perf callback:', error);
      }
    });
  }
}

// Singleton instance
let perfHUDInstance: PerfHUDMonitor | null = null;

export function getPerfHUD(): PerfHUDMonitor {
  if (process.env.NODE_ENV !== "development") {
    // Return a no-op instance in production
    return {
      startPerfHUD: () => {},
      stopPerfHUD: () => {},
      onMetricsUpdate: () => () => {},
      getMetrics: () => ({
        tti: null,
        clientFetchP95: null,
        renderCommits: 0,
        droppedFrames: 0,
        memoryEstimate: null
      }),
      getThresholds: () => THRESHOLDS,
      trackClientFetch: () => {},
      trackReactCommit: () => {}
    } as PerfHUDMonitor;
  }

  if (!perfHUDInstance) {
    perfHUDInstance = new PerfHUDMonitor();
  }
  return perfHUDInstance;
}

/**
 * Utility function to track client data fetches
 */
export function trackClientFetch<T>(fetchFn: () => Promise<T>): Promise<T> {
  const start = performance.now();
  return fetchFn().finally(() => {
    const duration = performance.now() - start;
    getPerfHUD().trackClientFetch(duration);
  });
}

/**
 * Utility function to track React commits
 */
export function trackReactCommit(): void {
  getPerfHUD().trackReactCommit();
}

/**
 * Get performance status for a metric
 */
export function getPerfStatus(value: number | null, thresholds: { pass: number; warn: number; fail: number }): 'PASS' | 'WARN' | 'FAIL' | 'UNKNOWN' {
  if (value === null) return 'UNKNOWN';
  if (value <= thresholds.pass) return 'PASS';
  if (value <= thresholds.warn) return 'WARN';
  return 'FAIL';
}
