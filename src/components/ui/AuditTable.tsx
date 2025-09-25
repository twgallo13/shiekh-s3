"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";
import { useRole } from "@/components/providers/RoleProvider";
import downloadCsv from "@/lib/client/downloadCsv";

interface AuditEntry {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  correlationId: string;
  reasonCode?: string;
  details: string;
}

interface AuditTableProps {
  className?: string;
}

/**
 * Audit Table Component - Admin/FM Only
 * Displays audit entries with filtering and export capabilities
 * RBAC: Only visible to Admin and Finance Manager roles
 */
export default function AuditTable({ className = "" }: AuditTableProps) {
  const { effectiveRole } = useRole();
  const [auditData, setAuditData] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    actorUserId: "",
    actorRole: "",
    correlationId: ""
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
            <p className="text-gray-600">You do not have permission to view audit data.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock data for development
  useEffect(() => {
    const loadAuditData = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock audit data
        const mockData: AuditEntry[] = [
          {
            id: "audit-001",
            timestamp: "2024-01-15T10:30:00Z",
            actorUserId: "user-123",
            actorRole: "ADMIN",
            action: "USER_LOGIN",
            correlationId: "corr-abc123",
            reasonCode: "AUTH_SUCCESS",
            details: "User successfully logged in from IP 192.168.1.100"
          },
          {
            id: "audit-002",
            timestamp: "2024-01-15T10:25:00Z",
            actorUserId: "user-456",
            actorRole: "FM",
            action: "BUDGET_APPROVAL",
            correlationId: "corr-def456",
            reasonCode: "APPROVAL_GRANTED",
            details: "Budget approval granted for Q1 2024 forecast"
          },
          {
            id: "audit-003",
            timestamp: "2024-01-15T10:20:00Z",
            actorUserId: "user-789",
            actorRole: "SM",
            action: "VARIANCE_CREATED",
            correlationId: "corr-ghi789",
            reasonCode: "THRESHOLD_EXCEEDED",
            details: "Variance created for product SKU-12345, amount: $1,250.00"
          },
          {
            id: "audit-004",
            timestamp: "2024-01-15T10:15:00Z",
            actorUserId: "user-123",
            actorRole: "ADMIN",
            action: "ROLE_ASSIGNED",
            correlationId: "corr-jkl012",
            reasonCode: "PERMISSION_GRANTED",
            details: "Role 'FM' assigned to user user-456"
          },
          {
            id: "audit-005",
            timestamp: "2024-01-15T10:10:00Z",
            actorUserId: "user-456",
            actorRole: "FM",
            action: "EXPORT_AUDIT",
            correlationId: "corr-mno345",
            reasonCode: "EXPORT_REQUESTED",
            details: "Audit data exported to CSV format"
          }
        ];
        
        setAuditData(mockData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit data");
      } finally {
        setLoading(false);
      }
    };

    loadAuditData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      actorUserId: "",
      actorRole: "",
      correlationId: ""
    });
  };

  const exportToCsv = () => {
    if (auditData.length === 0) return;
    
    const csvData = auditData.map(entry => [
      entry.timestamp,
      entry.actorUserId,
      entry.actorRole,
      entry.action,
      entry.correlationId,
      entry.reasonCode || '',
      entry.details
    ]);
    
    const headers = [
      'Timestamp',
      'Actor User ID',
      'Actor Role',
      'Action',
      'Correlation ID',
      'Reason Code',
      'Details'
    ];
    
    csvData.unshift(headers);
    downloadCsv(csvData, `audit-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const filteredData = auditData.filter(entry => {
    if (filters.dateFrom && entry.timestamp < filters.dateFrom) return false;
    if (filters.dateTo && entry.timestamp > filters.dateTo) return false;
    if (filters.actorUserId && !entry.actorUserId.toLowerCase().includes(filters.actorUserId.toLowerCase())) return false;
    if (filters.actorRole && entry.actorRole !== filters.actorRole) return false;
    if (filters.correlationId && !entry.correlationId.toLowerCase().includes(filters.correlationId.toLowerCase())) return false;
    return true;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters Toolbar */}
        <div className="mb-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actor User ID
              </label>
              <input
                type="text"
                value={filters.actorUserId}
                onChange={(e) => handleFilterChange('actorUserId', e.target.value)}
                placeholder="Filter by user ID"
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actor Role
              </label>
              <select
                value={filters.actorRole}
                onChange={(e) => handleFilterChange('actorRole', e.target.value)}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="FM">Finance Manager</option>
                <option value="SM">Store Manager</option>
                <option value="DM">Department Manager</option>
                <option value="WHS">Warehouse Supervisor</option>
                <option value="AM">Area Manager</option>
                <option value="COST_ANALYST">Cost Analyst</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correlation ID
              </label>
              <input
                type="text"
                value={filters.correlationId}
                onChange={(e) => handleFilterChange('correlationId', e.target.value)}
                placeholder="Filter by correlation ID"
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
            <p className="text-gray-600">No audit entries found matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Timestamp</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Actor User ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Actor Role</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Action</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Correlation ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Reason Code</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 font-mono text-sm">
                      {entry.actorUserId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {entry.actorRole}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 font-medium">
                      {entry.action}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 font-mono text-sm">
                      {entry.correlationId}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      {entry.reasonCode && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {entry.reasonCode}
                        </span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-gray-700 text-sm">
                      {entry.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
          <p>Showing {filteredData.length} of {auditData.length} audit entries</p>
          <p className="mt-1">Immutable audit per §13.3 - All entries are permanent and cannot be modified</p>
        </div>
      </CardContent>
    </Card>
  );
}
