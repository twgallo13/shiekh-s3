"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VersionBadge } from '@/components/VersionBadge';
import { Role } from '@/lib/guards';
import { useRole } from '@/components/providers/RoleProvider';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useToast } from '@/components/ui/ToastHost';
import { getStatusColor, getUrgencyColor } from '@/lib/hooks/useStickyFilters';
import { type ApprovalItem } from '@/lib/approvals/ordering';

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { effectiveRole } = useRole();
  const toast = useToast();
  
  const [approval, setApproval] = useState<ApprovalItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const approvalId = params.id as string;
  
  // Check if user has permission to view approvals
  const canViewApprovals = [Role.ADMIN, Role.FM, Role.DM].includes(effectiveRole as Role);
  
  // Mock approval data - in a real app this would come from the database
  const mockApprovals: ApprovalItem[] = [
    {
      id: '1',
      status: 'PENDING',
      urgency: 'HIGH',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      description: 'Purchase Order #12345 - Emergency equipment request',
      user: 'John Doe',
      target: 'Purchase Order #12345',
      details: {
        amount: '$15,000',
        vendor: 'TechCorp Solutions',
        items: ['Laptop computers (10x)', 'Network equipment', 'Software licenses'],
        justification: 'Emergency replacement of failed equipment affecting daily operations',
        attachments: ['purchase_order_12345.pdf', 'vendor_quote.pdf']
      }
    },
    {
      id: '2',
      status: 'APPROVED',
      urgency: 'MEDIUM',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      description: 'Budget Request #67890 - Q4 marketing budget',
      user: 'Jane Smith',
      target: 'Budget Request #67890',
      details: {
        amount: '$25,000',
        department: 'Marketing',
        purpose: 'Q4 marketing campaign',
        justification: 'Annual marketing budget for holiday season campaign',
        attachments: ['marketing_plan.pdf', 'budget_breakdown.xlsx']
      }
    },
    {
      id: '3',
      status: 'PENDING',
      urgency: 'LOW',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      description: 'Equipment Request #11111 - Standard office supplies',
      user: 'Bob Wilson',
      target: 'Equipment Request #11111',
      details: {
        amount: '$500',
        vendor: 'Office Depot',
        items: ['Office chairs (5x)', 'Desk lamps', 'Stationery supplies'],
        justification: 'Regular office supplies replenishment',
        attachments: ['supply_list.pdf']
      }
    }
  ];
  
  // Load approval data
  useEffect(() => {
    const loadApproval = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundApproval = mockApprovals.find(a => a.id === approvalId);
        if (foundApproval) {
          setApproval(foundApproval);
        } else {
          toast({
            kind: 'err',
            text: `Approval with ID ${approvalId} does not exist`,
          });
          router.push('/approvals');
        }
      } catch (error) {
        toast({
          kind: 'err',
          text: 'Failed to load approval',
        });
        router.push('/approvals');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (approvalId) {
      loadApproval();
    }
  }, [approvalId, router, toast]);
  
  // Handle approval action
  const handleApprovalAction = async (action: 'approve' | 'return') => {
    if (!approval) return;
    
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update approval status
      setApproval(prev => prev ? {
        ...prev,
        status: action === 'approve' ? 'APPROVED' : 'RETURNED',
        updatedAt: new Date().toISOString()
      } : null);
      
      toast({
        kind: 'ok',
        text: `Approval ${action === 'approve' ? 'approved' : 'returned'}`,
      });
      
      // Dispatch custom event for parent component to listen to
      const event = new CustomEvent('approvalAction', {
        detail: { id: approval.id, action, timestamp: new Date().toISOString() }
      });
      window.dispatchEvent(event);
      
    } catch (error) {
      toast({
        kind: 'err',
        text: `Failed to ${action} approval`,
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!canViewApprovals) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Approval Details</h1>
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
                <p>You do not have permission to view approval details. Only ADMIN, FM, and DM roles can access this page.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Approval Details</h1>
          <VersionBadge />
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-600">Loading approval details...</span>
        </div>
      </div>
    );
  }
  
  if (!approval) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Approval Details</h1>
          <VersionBadge />
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Approval Not Found
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>The requested approval could not be found.</p>
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
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Approval Details</h1>
        </div>
        <VersionBadge />
      </div>
      
      {/* Approval Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Approval #{approval.id}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge>
                {approval.status}
              </Badge>
              <Badge>
                {approval.urgency}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{approval.description}</h3>
              <p className="text-sm text-gray-600 mt-1">Requested by {approval.user}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-600">{new Date(approval.createdAt).toLocaleString()}</p>
              </div>
              {approval.updatedAt && (
                <div>
                  <span className="font-medium text-gray-700">Last Updated:</span>
                  <p className="text-gray-600">{new Date(approval.updatedAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Approval Details */}
      {approval.details && (
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approval.details.amount && (
                <div>
                  <span className="font-medium text-gray-700">Amount:</span>
                  <p className="text-lg font-semibold text-gray-900">{approval.details.amount}</p>
                </div>
              )}
              
              {approval.details.vendor && (
                <div>
                  <span className="font-medium text-gray-700">Vendor:</span>
                  <p className="text-gray-600">{approval.details.vendor}</p>
                </div>
              )}
              
              {approval.details.department && (
                <div>
                  <span className="font-medium text-gray-700">Department:</span>
                  <p className="text-gray-600">{approval.details.department}</p>
                </div>
              )}
              
              {approval.details.purpose && (
                <div>
                  <span className="font-medium text-gray-700">Purpose:</span>
                  <p className="text-gray-600">{approval.details.purpose}</p>
                </div>
              )}
              
              {approval.details.justification && (
                <div>
                  <span className="font-medium text-gray-700">Justification:</span>
                  <p className="text-gray-600">{approval.details.justification}</p>
                </div>
              )}
              
              {approval.details.items && (
                <div>
                  <span className="font-medium text-gray-700">Items:</span>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    {approval.details.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {approval.details.attachments && (
                <div>
                  <span className="font-medium text-gray-700">Attachments:</span>
                  <ul className="list-disc list-inside text-gray-600 mt-1">
                    {approval.details.attachments.map((attachment, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span>{attachment}</span>
                        <Button variant="outline">
                          Download
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Action Buttons */}
      {approval.status === 'PENDING' && (
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                onClick={() => handleApprovalAction('approve')}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isProcessing ? 'Processing...' : 'Approve'}
              </Button>
              <Button
                onClick={() => handleApprovalAction('return')}
                disabled={isProcessing}
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {isProcessing ? 'Processing...' : 'Return'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
