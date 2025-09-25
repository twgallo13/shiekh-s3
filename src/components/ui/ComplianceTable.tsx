"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { useRole } from "@/components/providers/RoleProvider";
import downloadCsv from "@/lib/client/downloadCsv";

interface ComplianceEvent {
  id: string;
  timestamp: string;
  type: string;
  status: string;
  warehouseId: string;
  details: string;
}

interface ComplianceTableProps {
  className?: string;
}

/**
 * Compliance Table Component - Admin/FM Only
 * Displays compliance events with filtering capabilities
 * RBAC: Only visible to Admin and Finance Manager roles
 */
export default function ComplianceTable({ className = "" }: ComplianceTableProps) {
  const { effectiveRole } = useRole();
  const [complianceData, setComplianceData] = useState<ComplianceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    warehouseId: "",
    limit: "50",
    offset: "0"
  });

  // RBAC check - only Admin and FM can access
  if (!["ADMIN", "FM"].includes(effectiveRole)) {
    return (
      <Card className={className}>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Permission Denied</h2>
            <p className="text-gray-600">You do not have permission to view compliance data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data for development
  useEffect(() => {
    const loadComplianceData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock compliance data
        const mockData: ComplianceEvent[] = [
          {
            id: "comp-001",
            timestamp: "2024-01-15T14:30:00Z",
            type: "SAFETY_INSPECTION",
            status: "PASSED",
            warehouseId: "WH-001",
            details: "Monthly safety inspection completed - all safety protocols followed"
          },
          {
            id: "comp-002",
            timestamp: "2024-01-15T13:45:00Z",
            type: "INVENTORY_AUDIT",
            status: "FAILED",
            warehouseId: "WH-002",
            details: "Inventory discrepancy found - 15 items missing from expected count"
          },
          {
            id: "comp-003",
            timestamp: "2024-01-15T12:20:00Z",
            type: "ENVIRONMENTAL_CHECK",
            status: "PASSED",
            warehouseId: "WH-001",
            details: "Environmental compliance check - temperature and humidity within limits"
          },
          {
            id: "comp-004",
            timestamp: "2024-01-15T11:15:00Z",
            type: "SECURITY_REVIEW",
            status: "WARNING",
            warehouseId: "WH-003",
            details: "Security camera offline for 2 hours - maintenance scheduled"
          },
          {
            id: "comp-005",
            timestamp: "2024-01-15T10:00:00Z",
            type: "QUALITY_CONTROL",
            status: "PASSED",
            warehouseId: "WH-002",
            details: "Quality control inspection - all products meet standards"
          },
          {
            id: "comp-006",
            timestamp: "2024-01-15T09:30:00Z",
            type: "FIRE_SAFETY",
            status: "PASSED",
            warehouseId: "WH-001",
            details: "Fire safety equipment check - all extinguishers and alarms functional"
          },
          {
            id: "comp-007",
            timestamp: "2024-01-15T08:45:00Z",
            type: "DOCUMENTATION_REVIEW",
            status: "FAILED",
            warehouseId: "WH-003",
            details: "Missing documentation for 3 shipments - follow-up required"
          }
        ];
        
        setComplianceData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load compliance data");
      } finally {
        setLoading(false);
      }
    };

    loadComplianceData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      status: "",
      warehouseId: "",
      limit: "50",
      offset: "0"
    });
  };

  const exportToCsv = () => {
    if (complianceData.length === 0) return;
    
    const csvData = complianceData.map(event => [
      event.timestamp,
      event.type,
      event.status,
      event.warehouseId,
      event.details
    ]);
    
    const headers = [
      'Timestamp',
      'Type',
      'Status',
      'Warehouse ID',
      'Details'
    ];
    
    csvData.unshift(headers);
    downloadCsv(csvData, `compliance-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredData = complianceData.filter(event => {
    if (filters.type && event.type !== filters.type) return false;
    if (filters.status && event.status !== filters.status) return false;
    if (filters.warehouseId && !event.warehouseId.toLowerCase().includes(filters.warehouseId.toLowerCase())) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASSED':
        return 'bg-green-100 text-green-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SAFETY_INSPECTION':
        return 'bg-blue-100 text-blue-800';
      case 'INVENTORY_AUDIT':
        return 'bg-purple-100 text-purple-800';
      case 'ENVIRONMENTAL_CHECK':
        return 'bg-green-100 text-green-800';
      case 'SECURITY_REVIEW':
        return 'bg-orange-100 text-orange-800';
      case 'QUALITY_CONTROL':
        return 'bg-indigo-100 text-indigo-800';
      case 'FIRE_SAFETY':
        return 'bg-red-100 text-red-800';
      case 'DOCUMENTATION_REVIEW':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Compliance Events</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters Toolbar */}
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="SAFETY_INSPECTION">Safety Inspection</option>
                <option value="INVENTORY_AUDIT">Inventory Audit</option>
                <option value="ENVIRONMENTAL_CHECK">Environmental Check</option>
                <option value="SECURITY_REVIEW">Security Review</option>
                <option value="QUALITY_CONTROL">Quality Control</option>
                <option value="FIRE_SAFETY">Fire Safety</option>
                <option value="DOCUMENTATION_REVIEW">Documentation Review</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="PASSED">Passed</option>
                <option value="FAILED">Failed</option>
                <option value="WARNING">Warning</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Warehouse ID
              </label>
              <input
                type="text"
                value={filters.warehouseId}
                onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
                placeholder="Filter by warehouse ID"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit
              </label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Offset
              </label>
              <input
                type="number"
                value={filters.offset}
                onChange={(e) => handleFilterChange('offset', e.target.value)}
                min="0"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
            <Button variant="outline" onClick={exportToCsv} disabled={filteredData.length === 0}>
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
            <Skeleton className="h-5" />
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
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No compliance events found matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Timestamp</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Type</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Status</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Warehouse ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs ${getTypeColor(event.type)}`}>
                        {event.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 font-mono text-sm">
                      {event.warehouseId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 text-sm">
                      {event.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Showing {filteredData.length} of {complianceData.length} compliance events</p>
          <p className="mt-1">Compliance data is maintained per regulatory requirements</p>
        </div>
      </CardContent>
    </Card>
  );
}
