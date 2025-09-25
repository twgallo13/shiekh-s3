"use client";
import React, { useState, useEffect } from "react";
import { VersionBadge } from '@/components/VersionBadge';
import { Role } from '@/lib/guards';
import { useRole } from '@/components/providers/RoleProvider';
import { useStickyFilters, getFilterCounts } from '@/lib/hooks/useStickyFilters';
import { sortApprovalsPendingFirst, type ApprovalItem } from '@/lib/approvals/ordering';
import ApprovalsList from '@/components/ui/ApprovalsList';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/ToastHost';

export default function ApprovalsPage() {
  const { effectiveRole } = useRole();
  const toast = useToast();
  
  // Use sticky filters with role-based persistence
  const { filters, setFilters, clearFilters, hasActiveFilters, getFilterChips } = useStickyFilters(effectiveRole);
  
  // Mock approval data - in a real app this would come from the database
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    {
      id: '1',
      status: 'PENDING',
      urgency: 'HIGH',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: 'Purchase Order #12345 - Emergency equipment request',
      user: 'John Doe',
      target: 'Purchase Order #12345',
    },
    {
      id: '2',
      status: 'APPROVED',
      urgency: 'MEDIUM',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      description: 'Budget Request #67890 - Q4 marketing budget',
      user: 'Jane Smith',
      target: 'Budget Request #67890',
    },
    {
      id: '3',
      status: 'PENDING',
      urgency: 'LOW',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      description: 'Equipment Request #11111 - Standard office supplies',
      user: 'Bob Wilson',
      target: 'Equipment Request #11111',
    },
    {
      id: '4',
      status: 'RETURNED',
      urgency: 'HIGH',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      description: 'Vendor Contract #22222 - Missing documentation',
      user: 'Alice Johnson',
      target: 'Vendor Contract #22222',
    },
    {
      id: '5',
      status: 'PENDING',
      urgency: 'MEDIUM',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      description: 'Travel Request #33333 - Conference attendance',
      user: 'Charlie Brown',
      target: 'Travel Request #33333',
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user has permission to view approvals
  const canViewApprovals = [Role.ADMIN, Role.FM, Role.DM].includes(effectiveRole as Role);
  
  // Get counts for the header
  const counts = getFilterCounts(approvals);
  
  // Handle approval actions
  const handleApprovalAction = async (id: string, action: 'approve' | 'return', reason?: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the approval status
      setApprovals(prev => prev.map(approval => 
        approval.id === id 
          ? { 
              ...approval, 
              status: action === 'approve' ? 'APPROVED' : 'RETURNED',
              updatedAt: new Date().toISOString()
            }
          : approval
      ));
      
    } catch (error) {
      throw error; // Re-throw to be handled by ApprovalsList
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // In a real app, this would fetch fresh data from the API
    } catch (error) {
      toast({
        kind: 'err',
        text: 'Failed to refresh approvals data',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!canViewApprovals) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
          <VersionBadge />
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>You do not have permission to view approval requests. Only ADMIN, FM, and DM roles can access this page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <VersionBadge />
      </div>
      
      {/* Counts Header */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Pending:</span>
              <Badge>{counts.pending}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Approved Today:</span>
              <Badge>{counts.approvedToday}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Returned Today:</span>
              <Badge>{counts.returnedToday}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <Badge>{counts.total}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Filters Toolbar */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                <select
                  id="status-filter"
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label htmlFor="urgency-filter" className="text-sm font-medium text-gray-700">
                  Urgency:
                </label>
                <select
                  id="urgency-filter"
                  value={filters.urgency || ''}
                  onChange={(e) => setFilters({ ...filters, urgency: e.target.value as any || undefined })}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Urgencies</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              )}
              
              {/* Print View Button - Only for DM, FM, Admin */}
              {["DM", "FM", "ADMIN"].includes(effectiveRole) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (filters.status) params.set('status', filters.status);
                    if (filters.urgency) params.set('urgency', filters.urgency);
                    window.open(`/approvals/print?${params.toString()}`, '_blank');
                  }}
                >
                  Print View
                </Button>
              )}
            </div>
            
            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {getFilterChips().map((chip) => (
                  <Badge key={chip.key}>
                    {chip.label}: {chip.value}
                    <button
                      onClick={chip.onRemove}
                      className="ml-1 text-gray-400 hover:text-gray-600"
                      aria-label={`Remove ${chip.label} filter`}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Approvals List */}
      <ApprovalsList
        approvals={approvals}
        filters={filters}
        onApprovalAction={handleApprovalAction}
        onRefresh={handleRefresh}
        className="space-y-4"
      />
      
      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Approvals API</span>
              <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                POST /api/approvals
              </code>
            </div>
            <div className="text-sm text-gray-600">
              <p>Actions: <code className="bg-gray-100 px-1 rounded">request</code>, <code className="bg-gray-100 px-1 rounded">grant</code>, <code className="bg-gray-100 px-1 rounded">deny</code></p>
              <p className="mt-1">RBAC: Only ADMIN and FM roles can grant/deny approvals</p>
              <p className="mt-1">Keyboard shortcuts: <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">N</kbd> Next Pending, <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift+N</kbd> Previous Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}