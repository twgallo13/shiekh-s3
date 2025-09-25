"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  getKpisForRole, 
  saveKpiOverrides, 
  clearKpiOverrides, 
  loadKpiOverrides,
  hasKpiOverrides,
  type KpiDefinition, 
  type KpiThreshold, 
  type KpiOverrides,
  type Role 
} from "@/lib/kpi/registry";
import { useRole } from "@/components/providers/RoleProvider";
import { useToast } from "@/components/ui/ToastHost";

interface KpiEditorProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * KPI Editor Component - Development Only
 * Allows editing of KPI thresholds with live preview and spec-default reset
 */
export default function KpiEditor({ isOpen, onClose }: KpiEditorProps) {
  const { effectiveRole } = useRole();
  const toast = useToast();
  
  const [kpis, setKpis] = useState<KpiDefinition[]>([]);
  const [overrides, setOverrides] = useState<KpiOverrides>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Only render in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }
  
  // Load KPIs and overrides on mount
  useEffect(() => {
    if (isOpen) {
      const roleKpis = getKpisForRole(effectiveRole as Role);
      const currentOverrides = loadKpiOverrides();
      setKpis(roleKpis);
      setOverrides(currentOverrides);
      setHasChanges(false);
    }
  }, [isOpen, effectiveRole]);
  
  // Handle threshold changes
  const handleThresholdChange = (metricId: string, field: keyof KpiThreshold, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setOverrides(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [field]: numValue
      }
    }));
    setHasChanges(true);
  };
  
  // Save overrides
  const handleSave = () => {
    saveKpiOverrides(overrides);
    setHasChanges(false);
    toast({
      kind: "ok",
      text: "KPI thresholds saved successfully"
    });
  };
  
  // Reset to spec defaults
  const handleReset = () => {
    clearKpiOverrides();
    setOverrides({});
    setHasChanges(false);
    toast({
      kind: "ok",
      text: "KPI thresholds reset to spec defaults"
    });
  };
  
  // Preview changes
  const handlePreview = () => {
    // Force re-render of KPI components by updating the registry
    window.dispatchEvent(new CustomEvent('kpiOverridesChanged', { detail: overrides }));
    toast({
      kind: "ok",
      text: "Preview updated - check KPI widgets"
    });
  };
  
  if (!isOpen) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <Card className="border-0 shadow-none h-full flex flex-col">
          <CardHeader className="pb-3 flex-shrink-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                KPI Thresholds Editor
              </CardTitle>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Development-only editor for adjusting KPI thresholds. Changes are saved to localStorage and do not affect production builds.
            </p>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto">
            <div className="space-y-6">
              {/* Current Role Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-blue-900">Current Role:</span>
                  <Badge>{effectiveRole}</Badge>
                  <span className="text-sm text-blue-700">
                    ({kpis.length} KPIs available)
                  </span>
                </div>
              </div>
              
              {/* KPI Thresholds */}
              {kpis.map((kpi) => {
                const currentThreshold = overrides[kpi.metricId] || kpi.threshold;
                const hasOverride = hasKpiOverrides(kpi.metricId);
                
                return (
                  <Card key={kpi.metricId} className="border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{kpi.label}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            ID: {kpi.metricId} | Current Value: {kpi.value}{kpi.unit}
                          </p>
                        </div>
                        {hasOverride && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            (dev override)
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Target Threshold */}
                        <div>
                          <label htmlFor={`${kpi.metricId}-target`} className="block text-sm font-medium text-gray-700 mb-1">
                            Target
                          </label>
                          <input
                            id={`${kpi.metricId}-target`}
                            type="number"
                            step="0.1"
                            value={currentThreshold.target}
                            onChange={(e) => handleThresholdChange(kpi.metricId, 'target', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        {/* Warning Threshold */}
                        <div>
                          <label htmlFor={`${kpi.metricId}-warn`} className="block text-sm font-medium text-gray-700 mb-1">
                            Warning
                          </label>
                          <input
                            id={`${kpi.metricId}-warn`}
                            type="number"
                            step="0.1"
                            value={currentThreshold.warn}
                            onChange={(e) => handleThresholdChange(kpi.metricId, 'warn', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        {/* Critical Threshold */}
                        <div>
                          <label htmlFor={`${kpi.metricId}-critical`} className="block text-sm font-medium text-gray-700 mb-1">
                            Critical
                          </label>
                          <input
                            id={`${kpi.metricId}-critical`}
                            type="number"
                            step="0.1"
                            value={currentThreshold.critical}
                            onChange={(e) => handleThresholdChange(kpi.metricId, 'critical', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Threshold Preview */}
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Current Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs ${
                            kpi.value <= currentThreshold.critical 
                              ? 'bg-red-100 text-red-800' 
                              : kpi.value <= currentThreshold.warn 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {kpi.value <= currentThreshold.critical 
                              ? 'Critical' 
                              : kpi.value <= currentThreshold.warn 
                                ? 'Warning' 
                                : 'Good'
                            }
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <Button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Overrides
                </Button>
                
                <Button
                  onClick={handlePreview}
                  variant="outline"
                >
                  Preview Changes
                </Button>
                
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Reset to Spec Defaults
                </Button>
              </div>
              
              {/* Footer Notes */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Development Notes</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Threshold overrides are stored in localStorage under 'dev:kpiThresholds'</li>
                  <li>• Changes only affect development builds and are not persisted to production</li>
                  <li>• Use "Preview Changes" to see real-time updates in KPI widgets</li>
                  <li>• "Reset to Spec Defaults" clears all overrides and restores original thresholds</li>
                  <li>• Thresholds follow the pattern: Critical ≤ Warning ≤ Target (for most KPIs)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Hook for managing KPI Editor state
 */
export function useKpiEditor() {
  const [isOpen, setIsOpen] = useState(false);

  const openKpiEditor = () => setIsOpen(true);
  const closeKpiEditor = () => setIsOpen(false);

  return {
    isOpen,
    openKpiEditor,
    closeKpiEditor,
    KpiEditorComponent: (
      <KpiEditor
        isOpen={isOpen}
        onClose={closeKpiEditor}
      />
    )
  };
}
