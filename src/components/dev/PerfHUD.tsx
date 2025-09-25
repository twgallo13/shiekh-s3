"use client";
import React, { useState, useEffect, useRef } from "react";
import { getPerfHUD, getPerfStatus, PerfMetrics, PerfThresholds } from "@/lib/perf/hud";

/**
 * Zebra Performance HUD - Development Only
 * Small draggable overlay showing performance metrics
 * Aligned to §14 budgets and DoD targets
 */
interface PerfHUDProps {
  onClose?: () => void;
}

export default function PerfHUD({ onClose }: PerfHUDProps = {}) {
  const [metrics, setMetrics] = useState<PerfMetrics>({
    tti: null,
    clientFetchP95: null,
    renderCommits: 0,
    droppedFrames: 0,
    memoryEstimate: null
  });
  const [thresholds, setThresholds] = useState<PerfThresholds | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  useEffect(() => {
    const perfHUD = getPerfHUD();
    setThresholds(perfHUD.getThresholds());

    const unsubscribe = perfHUD.onMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === dragRef.current || (e.target as HTMLElement).closest('.perf-hud-header')) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const getStatusColor = (status: 'PASS' | 'WARN' | 'FAIL' | 'UNKNOWN') => {
    switch (status) {
      case 'PASS':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'WARN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'FAIL':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'UNKNOWN':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadge = (value: number | null, thresholds: { pass: number; warn: number; fail: number }, unit: string = 'ms') => {
    const status = getPerfStatus(value, thresholds);
    const displayValue = value !== null ? `${Math.round(value)}${unit}` : 'N/A';
    
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs font-mono">{displayValue}</span>
        <span className={`px-1 py-0.5 rounded text-xs border ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>
    );
  };

  if (!thresholds) {
    return null;
  }

  return (
    <div
      ref={dragRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg select-none"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '200px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="perf-hud-header bg-gray-50 px-3 py-2 border-b border-gray-200 cursor-move">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Zebra Perf HUD</span>
            <span className="text-xs text-gray-500">Dev • §14 budgets</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xs"
            aria-label="Close performance HUD"
          >
            ×
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="p-3 space-y-2 text-xs">
        {/* TTI */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">TTI:</span>
          {getStatusBadge(metrics.tti, thresholds.tti)}
        </div>

        {/* Client Fetch P95 */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">API p95:</span>
          {getStatusBadge(metrics.clientFetchP95, thresholds.clientFetch)}
        </div>

        {/* Render Commits */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Commits:</span>
          {getStatusBadge(metrics.renderCommits, thresholds.renderCommits, '')}
        </div>

        {/* Dropped Frames */}
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Dropped:</span>
          {getStatusBadge(metrics.droppedFrames, thresholds.droppedFrames, '')}
        </div>

        {/* Memory Estimate */}
        {metrics.memoryEstimate !== null && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Memory:</span>
            <span className="text-xs font-mono">{metrics.memoryEstimate}MB</span>
          </div>
        )}

        {/* Targets */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Targets: TTI ≤150ms, API p95 ≤300ms</div>
            <div>DoD: React commits ≤20, Frames ≤5</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to show/hide the PerfHUD
 */
export function usePerfHUD() {
  const [isVisible, setIsVisible] = useState(false);

  const showPerfHUD = () => {
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true);
      const perfHUD = getPerfHUD();
      perfHUD.startPerfHUD();
    }
  };

  const hidePerfHUD = () => {
    setIsVisible(false);
    const perfHUD = getPerfHUD();
    perfHUD.stopPerfHUD();
  };

  const togglePerfHUD = () => {
    if (isVisible) {
      hidePerfHUD();
    } else {
      showPerfHUD();
    }
  };

  return {
    isVisible,
    showPerfHUD,
    hidePerfHUD,
    togglePerfHUD
  };
}
