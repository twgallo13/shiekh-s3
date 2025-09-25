"use client";
import React from "react";
import { KpiDefinition, getThresholdColor, formatKpiValue, hasKpiOverrides } from "@/lib/kpi/registry";

interface KpiMiniProps {
  kpi: KpiDefinition;
  className?: string;
}

/**
 * Compact KPI mini-widget with threshold coloring and accessibility
 * Follows §11 specification format with role-aware visibility
 */
export default function KpiMini({ kpi, className = "" }: KpiMiniProps) {
  const thresholdColor = getThresholdColor(kpi.value, kpi.threshold);
  const formattedValue = formatKpiValue(kpi.value, kpi.unit);
  const hasOverride = hasKpiOverrides(kpi.metricId);

  // Get trend arrow
  const getTrendArrow = () => {
    switch (kpi.trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
      default:
        return '';
    }
  };

  // Get threshold color classes
  const getColorClasses = () => {
    switch (thresholdColor) {
      case 'critical':
        return 'border-red-300 bg-red-50 text-red-800';
      case 'warn':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      case 'neutral':
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  // Get sparkline color
  const getSparklineColor = () => {
    switch (thresholdColor) {
      case 'critical':
        return '#ef4444'; // red-500
      case 'warn':
        return '#eab308'; // yellow-500
      case 'neutral':
      default:
        return '#6b7280'; // gray-500
    }
  };

  return (
    <div 
      className={`kpi-mini p-3 rounded-lg border ${getColorClasses()} ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${kpi.label}: ${formattedValue}`}
    >
      {/* Header with label and trend */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <h4 className="text-sm font-medium truncate" title={kpi.label}>
            {kpi.label}
          </h4>
          {hasOverride && (
            <span 
              className="text-xs text-blue-600 font-medium"
              title="Development override active"
              aria-label="Development override active"
            >
              (dev)
            </span>
          )}
        </div>
        {kpi.trend && (
          <span 
            className="text-lg leading-none"
            aria-label={`Trend: ${kpi.trend}`}
            title={`Trend: ${kpi.trend}`}
          >
            {getTrendArrow()}
          </span>
        )}
      </div>

      {/* Value display */}
      <div className="mb-2">
        <span 
          className="text-2xl font-bold"
          aria-label={`Value: ${formattedValue}`}
        >
          {formattedValue}
        </span>
      </div>

      {/* Sparkline placeholder */}
      {kpi.sparkline && kpi.sparkline.length > 0 && (
        <div className="h-8 flex items-end gap-0.5">
          {kpi.sparkline.map((point, index) => {
            const maxValue = Math.max(...kpi.sparkline!);
            const minValue = Math.min(...kpi.sparkline!);
            const range = maxValue - minValue;
            const height = range > 0 ? ((point - minValue) / range) * 100 : 50;
            
            return (
              <div
                key={index}
                className="flex-1 rounded-sm"
                style={{
                  height: `${Math.max(height, 10)}%`,
                  backgroundColor: getSparklineColor(),
                  opacity: 0.7
                }}
                aria-hidden="true"
              />
            );
          })}
        </div>
      )}

      {/* Threshold indicator */}
      <div className="mt-2 text-xs opacity-75">
        <span className="sr-only">
          Threshold status: {thresholdColor}
        </span>
        <div className="flex items-center gap-1">
          <div 
            className={`w-2 h-2 rounded-full ${
              thresholdColor === 'critical' ? 'bg-red-500' :
              thresholdColor === 'warn' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            aria-hidden="true"
          />
          <span className="capitalize">{thresholdColor}</span>
        </div>
      </div>

      {/* Screen reader only: detailed information */}
      <div className="sr-only">
        <p>
          Metric ID: {kpi.metricId}
        </p>
        <p>
          Target: {formatKpiValue(kpi.threshold.target, kpi.unit)}
        </p>
        <p>
          Warning threshold: {formatKpiValue(kpi.threshold.warn, kpi.unit)}
        </p>
        <p>
          Critical threshold: {formatKpiValue(kpi.threshold.critical, kpi.unit)}
        </p>
        <p>
          Visible to roles: {kpi.roleVisibility.join(', ')}
        </p>
      </div>
    </div>
  );
}
