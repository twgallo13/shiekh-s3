"use client";
import React from "react";
import { Button } from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { useRole } from "@/components/providers/RoleProvider";

interface TableActionsProps {
  onRefresh?: () => void;
  onExport?: () => void;
  onClearFilters?: () => void;
  onPrint?: () => void;
  disabled?: {
    refresh?: boolean;
    export?: boolean;
    clearFilters?: boolean;
    print?: boolean;
  };
  className?: string;
}

/**
 * Standardized table command actions with RBAC and accessibility
 * Provides Refresh, Export, Clear Filters, and Print actions
 */
export default function TableActions({
  onRefresh,
  onExport,
  onClearFilters,
  onPrint,
  disabled = {},
  className = ""
}: TableActionsProps) {
  const { effectiveRole } = useRole();

  // RBAC permissions for actions
  const canRefresh = ["ANON", "USER", "ADMIN", "FM", "VIEWER"].includes(effectiveRole);
  const canExport = ["USER", "ADMIN", "FM", "VIEWER"].includes(effectiveRole);
  const canClearFilters = ["USER", "ADMIN", "FM", "VIEWER"].includes(effectiveRole);
  const canPrint = ["ANON", "USER", "ADMIN", "FM", "VIEWER"].includes(effectiveRole);

  const actions = [
    {
      id: "refresh",
      label: "Refresh",
      hotkey: "R",
      onClick: onRefresh,
      disabled: disabled.refresh || !canRefresh,
      icon: "🔄"
    },
    {
      id: "export",
      label: "Export",
      hotkey: "E",
      onClick: onExport,
      disabled: disabled.export || !canExport,
      icon: "📊"
    },
    {
      id: "clear-filters",
      label: "Clear Filters",
      hotkey: "C",
      onClick: onClearFilters,
      disabled: disabled.clearFilters || !canClearFilters,
      icon: "🧹"
    },
    {
      id: "print",
      label: "Print",
      hotkey: "P",
      onClick: onPrint,
      disabled: disabled.print || !canPrint,
      icon: "🖨️"
    }
  ];

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      role="toolbar"
      aria-label="Table actions"
    >
      {actions.map((action) => (
        <Tooltip 
          key={action.id}
          label={`${action.label} (${action.hotkey})`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={`${action.label} (${action.hotkey})`}
            className="flex items-center gap-1"
          >
            <span className="text-sm">{action.icon}</span>
            <span className="hidden sm:inline">{action.label}</span>
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
