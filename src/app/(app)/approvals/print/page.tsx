"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRole } from "@/components/providers/RoleProvider";
import PrintFrame from "@/components/print/PrintFrame";
import Provenance from "@/components/print/Provenance";

interface ApprovalRequest {
  id: string;
  requestId: string;
  type: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  submittedAt: string;
  pendingTime: string;
  status: 'PENDING' | 'APPROVED' | 'RETURNED';
  submittedBy: string;
  amount?: number;
  description: string;
  correlationId: string;
}

/**
 * Print-Friendly Approvals Page - DM/FM/Admin Only
 * Mirrors approvals list with structured print layout
 * RBAC: Only accessible to DM, FM, and Admin roles
 */
export default function ApprovalsPrintPage() {
  const { effectiveRole } = useRole();
  const searchParams = useSearchParams();
  const [approvalsData, setApprovalsData] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC check - only DM, FM, and Admin can access
  if (!["DM", "FM", "ADMIN"].includes(effectiveRole)) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Permission Denied</h1>
          <p className="text-gray-600">You do not have permission to access this page.</p>
          <p className="text-sm text-gray-500 mt-2">Required roles: DM, FM, or ADMIN</p>
          <div className="mt-4 p-4 bg-gray-100 rounded text-left text-xs font-mono">
            <pre>{JSON.stringify({
              error: {
                code: "AUTH_002",
                message: "Insufficient privileges for operation",
                details: {
                  requiredRoles: ["DM", "FM", "ADMIN"],
                  currentRole: effectiveRole,
                  operation: "print_approvals"
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
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock approvals data
        const mockApprovalsData: ApprovalRequest[] = [
          {
            id: "approval-001",
            requestId: "REQ-2024-001",
            type: "BUDGET_APPROVAL",
            urgency: "HIGH",
            submittedAt: "2024-01-15T09:30:00Z",
            pendingTime: "2h 15m",
            status: "PENDING",
            submittedBy: "user-123",
            amount: 25000,
            description: "Q1 2024 Marketing Budget Approval",
            correlationId: "corr-abc123"
          },
          {
            id: "approval-002",
            requestId: "REQ-2024-002",
            type: "VARIANCE_APPROVAL",
            urgency: "MEDIUM",
            submittedAt: "2024-01-15T08:45:00Z",
            pendingTime: "3h 0m",
            status: "PENDING",
            submittedBy: "user-456",
            amount: 1500,
            description: "Inventory variance approval for SKU-12345",
            correlationId: "corr-def456"
          },
          {
            id: "approval-003",
            requestId: "REQ-2024-003",
            type: "PURCHASE_ORDER",
            urgency: "LOW",
            submittedAt: "2024-01-15T07:20:00Z",
            pendingTime: "4h 25m",
            status: "APPROVED",
            submittedBy: "user-789",
            amount: 8500,
            description: "Office supplies purchase order",
            correlationId: "corr-ghi789"
          },
          {
            id: "approval-004",
            requestId: "REQ-2024-004",
            type: "BUDGET_APPROVAL",
            urgency: "HIGH",
            submittedAt: "2024-01-14T16:30:00Z",
            pendingTime: "1d 1h 15m",
            status: "RETURNED",
            submittedBy: "user-101",
            amount: 50000,
            description: "Equipment purchase budget approval",
            correlationId: "corr-jkl012"
          }
        ];
        
        setApprovalsData(mockApprovalsData);
      } catch (error) {
        console.error('Failed to load approvals data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-print when page loads
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [loading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100';
      case 'LOW':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'text-blue-600 bg-blue-100';
      case 'APPROVED':
        return 'text-green-600 bg-green-100';
      case 'RETURNED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="text-center">
          <p className="text-gray-600">Loading approvals data for printing...</p>
        </div>
      </div>
    );
  }

  // Extract filters from search params
  const filters = {
    status: searchParams.get('status') || 'All',
    urgency: searchParams.get('urgency') || 'All',
    type: searchParams.get('type') || 'All',
    role: effectiveRole,
    recordCount: approvalsData.length
  };

  return (
    <PrintFrame 
      title="Approvals Report"
      subtitle={`Generated by ${effectiveRole} | ${getCurrentDate()}`}
    >
      {/* Provenance Block */}
      <Provenance 
        filters={filters}
        route="/approvals/print"
      />

      {/* Filter Summary */}
      <div className="print-filters mb-6 p-4 bg-gray-50 border border-gray-200 rounded avoid-break">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Filter Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Status:</span>
            <span className="ml-2">{filters.status}</span>
          </div>
          <div>
            <span className="font-medium">Urgency:</span>
            <span className="ml-2">{filters.urgency}</span>
          </div>
          <div>
            <span className="font-medium">Type:</span>
            <span className="ml-2">{filters.type}</span>
          </div>
          <div>
            <span className="font-medium">Total Records:</span>
            <span className="ml-2">{approvalsData.length}</span>
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="print-table avoid-break">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Requests</h2>
        <table className="w-full border-collapse border border-gray-300 text-sm print-table">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Request ID</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Type</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Urgency</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Submitted At</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Pending Time</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Status</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Amount</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-medium">Description</th>
            </tr>
          </thead>
          <tbody>
            {approvalsData.map((approval) => (
              <tr key={approval.id}>
                <td className="border border-gray-300 px-3 py-2 font-mono">{approval.requestId}</td>
                <td className="border border-gray-300 px-3 py-2">{approval.type.replace(/_/g, ' ')}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(approval.urgency)}`}>
                    {approval.urgency}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2">{formatDate(approval.submittedAt)}</td>
                <td className="border border-gray-300 px-3 py-2">{approval.pendingTime}</td>
                <td className="border border-gray-300 px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(approval.status)}`}>
                    {approval.status}
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">{formatAmount(approval.amount)}</td>
                <td className="border border-gray-300 px-3 py-2">{approval.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats mt-6 p-4 bg-blue-50 border border-blue-200 rounded avoid-break">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Summary Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Pending:</span>
            <span className="ml-2 text-blue-700">
              {approvalsData.filter(a => a.status === 'PENDING').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Approved:</span>
            <span className="ml-2 text-blue-700">
              {approvalsData.filter(a => a.status === 'APPROVED').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Returned:</span>
            <span className="ml-2 text-blue-700">
              {approvalsData.filter(a => a.status === 'RETURNED').length}
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-800">Total Amount:</span>
            <span className="ml-2 text-blue-700">
              {formatAmount(approvalsData.reduce((sum, a) => sum + (a.amount || 0), 0))}
            </span>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="signatures-section mt-8 pt-4 border-t border-gray-300 avoid-break">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Signatures</h3>
        <div className="grid grid-cols-3 gap-8">
          <div className="signature-block">
            <div className="border-b border-gray-300 pb-1 mb-2">
              <span className="text-sm font-medium">Prepared by</span>
            </div>
            <div className="h-12 border-b border-gray-300"></div>
            <div className="text-xs text-gray-500 mt-1">Name & Date</div>
          </div>
          <div className="signature-block">
            <div className="border-b border-gray-300 pb-1 mb-2">
              <span className="text-sm font-medium">Reviewed by</span>
            </div>
            <div className="h-12 border-b border-gray-300"></div>
            <div className="text-xs text-gray-500 mt-1">Name & Date</div>
          </div>
          <div className="signature-block">
            <div className="border-b border-gray-300 pb-1 mb-2">
              <span className="text-sm font-medium">Approved by</span>
            </div>
            <div className="h-12 border-b border-gray-300"></div>
            <div className="text-xs text-gray-500 mt-1">Name & Date</div>
          </div>
        </div>
      </div>

      {/* Important Notes */}
      <div className="important-notes mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded avoid-break">
        <h4 className="text-sm font-semibold text-yellow-800 mb-2">Important Notes</h4>
        <div className="text-xs text-yellow-700 space-y-1">
          <p><strong>Approval Authority:</strong> Only authorized roles (DM, FM, ADMIN) can approve requests.</p>
          <p><strong>Audit Trail:</strong> All approval actions are logged and cannot be modified.</p>
          <p><strong>Compliance:</strong> Approvals must follow company policies and regulatory requirements.</p>
        </div>
      </div>
    </PrintFrame>
  );
}
