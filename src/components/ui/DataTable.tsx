"use client";
import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TableActions from "@/components/ui/TableActions";
import downloadCsv from "@/lib/client/downloadCsv";
import { getPresetByName } from "@/lib/filters/presets";
import { useRole } from "@/components/providers/RoleProvider";

interface DataTableProps {
  title: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
  }>;
  onRefresh?: () => void;
  onClearFilters?: () => void;
  loading?: boolean;
  error?: string | null;
  className?: string;
  children?: React.ReactNode;
  // Filter preset support
  getCurrentFilters?: () => Record<string, string | number | boolean>;
  applyFilters?: (params: Record<string, string | number | boolean>) => void;
  route?: string;
}

export interface DataTableRef {
  getCurrentFilters: () => Record<string, string | number | boolean>;
  applyFilters: (params: Record<string, string | number | boolean>) => void;
}

/**
 * Standardized data table with command actions
 * Includes RBAC-aware actions and accessibility features
 */
const DataTable = forwardRef<DataTableRef, DataTableProps>(({
  title,
  data,
  columns,
  onRefresh,
  onClearFilters,
  loading = false,
  error = null,
  className = "",
  children,
  getCurrentFilters,
  applyFilters,
  route
}, ref) => {
  const [hasFilters, setHasFilters] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { effectiveRole } = useRole();

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    getCurrentFilters: getCurrentFiltersInternal,
    applyFilters: applyFiltersInternal
  }));

  // Check if filters are active (simplified check)
  useEffect(() => {
    // This would be more sophisticated in a real implementation
    // For now, we'll assume filters are active if data is filtered
    setHasFilters(data.length > 0);
  }, [data]);

  // Handle deep link presets
  useEffect(() => {
    if (route && applyFilters) {
      const presetName = searchParams.get('preset');
      if (presetName) {
        const preset = getPresetByName(route, effectiveRole, presetName);
        if (preset) {
          applyFiltersInternal(preset.params);
        }
      }
    }
  }, [searchParams, route, effectiveRole, applyFilters]);

  // Update URL when filters change
  const updateURL = (params: Record<string, string | number | boolean>) => {
    if (route && typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      
      // Clear existing filter params
      const filterKeys = Object.keys(params);
      filterKeys.forEach(key => url.searchParams.delete(key));
      
      // Add new filter params
      Object.entries(params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
      
      // Update URL without page reload
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  // Expose filter methods for parent components
  const getCurrentFiltersInternal = () => {
    if (getCurrentFilters) {
      return getCurrentFilters();
    }
    return {};
  };

  const applyFiltersInternal = (params: Record<string, string | number | boolean>) => {
    if (applyFilters) {
      applyFilters(params);
      updateURL(params);
    }
  };

  // Action handlers
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleExport = () => {
    if (data.length === 0) return;
    
    // Convert data to CSV format
    const csvData = data.map(row => 
      columns.map(col => {
        const value = row[col.key];
        // Handle complex values
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return String(value || '');
      })
    );
    
    // Add header row
    const headers = columns.map(col => col.label);
    csvData.unshift(headers);
    
    downloadCsv(`${title.toLowerCase().replace(/\s+/g, '-')}.csv`, csvData);
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const handlePrint = () => {
    if (tableRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              ${tableRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleRefresh();
          }
          break;
        case 'e':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleExport();
          }
          break;
        case 'c':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handleClearFilters();
          }
          break;
        case 'p':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            handlePrint();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onRefresh, onClearFilters]);

  return (
    <div className={`data-table ${className}`}>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <TableActions
          onRefresh={handleRefresh}
          onExport={handleExport}
          onClearFilters={handleClearFilters}
          onPrint={handlePrint}
          disabled={{
            refresh: loading,
            export: data.length === 0,
            clearFilters: !hasFilters,
            print: data.length === 0
          }}
        />
      </div>

      {/* Content */}
      {children}

      {/* Table */}
      <div ref={tableRef} className="overflow-x-auto">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No data available</p>
          </div>
        ) : (
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="border border-gray-300 px-4 py-2 text-gray-700"
                    >
                      {column.render 
                        ? column.render(row[column.key], row)
                        : String(row[column.key] || '')
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with count */}
      {data.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {data.length} row{data.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
});

DataTable.displayName = 'DataTable';

export default DataTable;
