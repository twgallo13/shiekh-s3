"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/components/providers/RoleProvider";
import PrintFrame from "@/components/print/PrintFrame";
import Provenance from "@/components/print/Provenance";

interface ComplianceItem {
  id: string;
  type: 'COMPLIANCE_VIOLATION' | 'AUDIT_FINDING' | 'REGULATORY_ALERT' | 'SECURITY_INCIDENT' | 'DATA_BREACH' | 'PROCESS_DEVIATION';
  status: 'NEW' | 'INVESTIGATING' | 'BLOCKED' | 'RESOLVED';
  title: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  correlationId: string;
  href?: string;
  notes?: string;
  slaDeadline?: string;
  tags?: string[];
}

/**
 * Print-Friendly Compliance Page - Admin/FM/WHS Only
 * Mirrors compliance triage with structured print layout
 * RBAC: Only accessible to Admin, FM, and WHS roles
 */
export default function CompliancePrintPage() {
  const { effectiveRole } = useRole();
  const searchParams = useSearchParams();
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC check - only Admin, FM, and WHS can access
  if (!["ADMIN", "FM", "WHS"].includes(effectiveRole)) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Permission Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required roles: Admin, FM, or WHS</p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs font-mono">
            <pre>{JSON.stringify({
              error: {
                code: "AUTH_002",
                message: "Insufficient privileges for operation",
                details: {
                  requiredRoles: ["ADMIN", "FM", "WHS"],
                  currentRole: effectiveRole,
                  operation: "print_compliance"
                }
              }
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Mock compliance data for print
        const mockData: ComplianceItem[] = [
          {
            id: 'comp-001',
            type: 'COMPLIANCE_VIOLATION',
            status: 'INVESTIGATING',
            title: 'Safety Protocol Violation - Warehouse A',
            details: 'Employee failed to follow proper safety procedures during equipment operation',
            severity: 'HIGH',
            priority: 'HIGH',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Safety Team',
            correlationId: 'corr-001',
            href: '/audit?correlationId=corr-001',
            notes: 'Initial investigation in progress',
            slaDeadline: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
            tags: ['safety', 'warehouse-a']
          },
          {
            id: 'comp-002',
            type: 'AUDIT_FINDING',
            status: 'NEW',
            title: 'Inventory Discrepancy - SKU-ELEC-001',
            details: 'Physical count shows 5 units but system shows 7 units',
            severity: 'MEDIUM',
            priority: 'MEDIUM',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            assignedTo: 'Inventory Team',
            correlationId: 'corr-002',
            href: '/audit?correlationId=corr-002',
            slaDeadline: new Date(Date.now() + 68 * 60 * 60 * 1000).toISOString(),
            tags: ['inventory', 'discrepancy']
          },
          {
            id: 'comp-003',
            type: 'SECURITY_INCIDENT',
            status: 'BLOCKED',
            title: 'Unauthorized Access Attempt',
            details: 'Multiple failed login attempts detected from suspicious IP address',
            severity: 'CRITICAL',
            priority: 'URGENT',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            assignedTo: 'Security Team',
            correlationId: 'corr-003',
            href: '/audit?correlationId=corr-003',
            notes: 'Blocked pending further investigation',
            slaDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
            tags: ['security', 'access']
          }
        ];

        setComplianceData(mockData);
      } catch (error) {
        console.error('Failed to load compliance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'text-blue-600';
      case 'INVESTIGATING': return 'text-yellow-600';
      case 'BLOCKED': return 'text-red-600';
      case 'RESOLVED': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'LOW': return 'text-gray-600';
      case 'MEDIUM': return 'text-blue-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSlaStatus = (deadline?: string) => {
    if (!deadline) return 'No SLA';
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilDeadline < 0) return 'OVERDUE';
    if (hoursUntilDeadline < 2) return 'WARNING';
    return 'ON_TIME';
  };

  const getSlaColor = (status: string) => {
    switch (status) {
      case 'OVERDUE': return 'text-red-600 font-bold';
      case 'WARNING': return 'text-orange-600 font-bold';
      case 'ON_TIME': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  const provenanceData = {
    generatedBy: effectiveRole,
    generatedAt: getCurrentDate(),
    filters: {
      status: searchParams.get('status') || 'All',
      severity: searchParams.get('severity') || 'All',
      type: searchParams.get('type') || 'All',
      role: effectiveRole,
      recordCount: complianceData.length
    }
  };

  return (
    <PrintFrame 
      title="Compliance Report"
      subtitle={`Generated by ${effectiveRole} | ${getCurrentDate()}`}
    >
      {/* Provenance Block */}
      <Provenance 
        data={provenanceData}
        className="mb-6"
      />

      {/* Summary Statistics */}
      <div className="summary-stats mb-6 p-4 bg-gray-50 border border-gray-200 rounded avoid-break">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{complianceData.filter(item => item.status === 'NEW').length}</div>
            <div className="text-gray-600">New Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{complianceData.filter(item => item.status === 'INVESTIGATING').length}</div>
            <div className="text-gray-600">Investigating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{complianceData.filter(item => item.status === 'BLOCKED').length}</div>
            <div className="text-gray-600">Blocked</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{complianceData.filter(item => item.status === 'RESOLVED').length}</div>
            <div className="text-gray-600">Resolved</div>
          </div>
        </div>
      </div>

      {/* Compliance Items Table */}
      <div className="compliance-table">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Compliance Items</h3>
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">ID</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Type</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Title</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Status</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Severity</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Priority</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Assigned To</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Created</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">SLA Status</th>
            </tr>
          </thead>
          <tbody>
            {complianceData.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="border border-gray-300 px-3 py-2 font-mono text-xs">{item.id}</td>
                <td className="border border-gray-300 px-3 py-2">{item.type.replace(/_/g, ' ')}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{item.details}</div>
                </td>
                <td className={`border border-gray-300 px-3 py-2 font-medium ${getStatusColor(item.status)}`}>
                  {item.status}
                </td>
                <td className={`border border-gray-300 px-3 py-2 font-medium ${getSeverityColor(item.severity)}`}>
                  {item.severity}
                </td>
                <td className="border border-gray-300 px-3 py-2">{item.priority}</td>
                <td className="border border-gray-300 px-3 py-2">{item.assignedTo || 'Unassigned'}</td>
                <td className="border border-gray-300 px-3 py-2 text-xs">{formatDate(item.createdAt)}</td>
                <td className={`border border-gray-300 px-3 py-2 text-xs ${getSlaColor(getSlaStatus(item.slaDeadline))}`}>
                  {getSlaStatus(item.slaDeadline)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Important Notes */}
      <div className="important-notes mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded avoid-break">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes</h4>
        <div className="text-xs text-yellow-700 space-y-1">
          <p><strong>Compliance Authority:</strong> Only authorized roles (Admin, FM, WHS) can manage compliance items.</p>
          <p><strong>Audit Trail:</strong> All compliance actions are logged and cannot be modified.</p>
          <p><strong>Regulatory Requirements:</strong> Compliance items must follow company policies and regulatory requirements.</p>
          <p><strong>SLA Deadlines:</strong> Critical items have 4-hour SLA, High items have 24-hour SLA, Medium items have 72-hour SLA.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="footer mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex justify-between">
          <div>
            <p><strong>Report Generated:</strong> {getCurrentDate()}</p>
            <p><strong>Generated By:</strong> {effectiveRole}</p>
          </div>
          <div className="text-right">
            <p><strong>Total Items:</strong> {complianceData.length}</p>
            <p><strong>System:</strong> Shiekh Supply S3</p>
          </div>
        </div>
      </div>
    </PrintFrame>
  );
}
