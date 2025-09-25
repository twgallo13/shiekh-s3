"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { 
  sortApprovalsPendingFirst, 
  getNextPendingIndex, 
  getPreviousPendingIndex,
  getApprovalStats,
  type ApprovalItem 
} from "@/lib/approvals/ordering";
import { 
  applyApprovalFilters, 
  getStatusColor, 
  getUrgencyColor,
  type ApprovalFilters 
} from "@/lib/hooks/useStickyFilters";
import { useRole } from "@/components/providers/RoleProvider";
import { useToast } from "@/components/ui/ToastHost";
import Tooltip from "@/components/ui/Tooltip";

interface ApprovalsListProps {
  approvals: ApprovalItem[];
  filters: ApprovalFilters;
  onApprovalAction: (id: string, action: 'approve' | 'return', reason?: string) => Promise<void>;
  onRefresh: () => void;
  className?: string;
}

/**
 * ApprovalsList Component
 * Displays approvals with keyboard navigation (N/Shift+N) and auto-advance after actions
 */
export default function ApprovalsList({
  approvals,
  filters,
  onApprovalAction,
  onRefresh,
  className = "",
}: ApprovalsListProps) {
  const router = useRouter();
  const { effectiveRole } = useRole();
  const toast = useToast();
  
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  // Apply filters and sort
  const filteredApprovals = applyApprovalFilters(approvals, filters);
  const sortedApprovals = sortApprovalsPendingFirst(filteredApprovals);
  
  // Get statistics
  const stats = getApprovalStats(sortedApprovals);
  
  // Navigate to next pending approval
  const navigateToNextPending = useCallback(() => {
    const nextIndex = getNextPendingIndex(sortedApprovals, selectedIndex);
    if (nextIndex !== -1) {
      setSelectedIndex(nextIndex);
      scrollToApproval(nextIndex);
    } else {
      toast({
        kind: "ok",
        text: "No more pending approvals",
      });
    }
  }, [sortedApprovals, selectedIndex, toast]);
  
  // Navigate to previous pending approval
  const navigateToPreviousPending = useCallback(() => {
    const prevIndex = getPreviousPendingIndex(sortedApprovals, selectedIndex);
    if (prevIndex !== -1) {
      setSelectedIndex(prevIndex);
      scrollToApproval(prevIndex);
    } else {
      toast({
        kind: "ok",
        text: "No previous pending approvals",
      });
    }
  }, [sortedApprovals, selectedIndex, toast]);
  
  // Scroll to specific approval
  const scrollToApproval = useCallback((index: number) => {
    if (listRef.current) {
      const approvalElement = listRef.current.children[index] as HTMLElement;
      if (approvalElement) {
        approvalElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, []);
  
  // Handle approval action with auto-advance
  const handleApprovalAction = useCallback(async (
    id: string, 
    action: 'approve' | 'return', 
    reason?: string
  ) => {
    setIsProcessing(id);
    
    try {
      await onApprovalAction(id, action, reason);
      
      // Auto-advance to next pending approval
      const currentApprovalIndex = sortedApprovals.findIndex(a => a.id === id);
      if (currentApprovalIndex !== -1) {
        const nextPendingIndex = getNextPendingIndex(sortedApprovals, currentApprovalIndex);
        if (nextPendingIndex !== -1) {
          setSelectedIndex(nextPendingIndex);
          scrollToApproval(nextPendingIndex);
        }
      }
      
      toast({
        kind: "ok",
        text: `Approval ${action === 'approve' ? 'approved' : 'returned'}`,
      });
      
    } catch (error) {
      toast({
        kind: "err",
        text: `Failed to ${action} approval`,
      });
    } finally {
      setIsProcessing(null);
    }
  }, [onApprovalAction, sortedApprovals, toast, scrollToApproval]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'n' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        navigateToNextPending();
      } else if (e.key === 'N' && e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        navigateToPreviousPending();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigateToNextPending, navigateToPreviousPending]);
  
  // Update selected index when approvals change
  useEffect(() => {
    if (selectedIndex >= sortedApprovals.length) {
      setSelectedIndex(Math.max(0, sortedApprovals.length - 1));
    }
  }, [sortedApprovals.length, selectedIndex]);
  
  if (sortedApprovals.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <p className="text-lg font-medium">No approvals found</p>
            <p className="text-sm mt-2">
              {Object.keys(filters).length > 0 
                ? "Try adjusting your filters to see more approvals"
                : "No approvals are currently available"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className={className}>
      {/* Statistics Header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Total:</span>
            <Badge>{stats.total}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Pending:</span>
            <Badge>{stats.pending}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Approved:</span>
            <Badge>{stats.approved}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Returned:</span>
            <Badge>{stats.returned}</Badge>
          </div>
        </div>
        
        {/* Keyboard Shortcuts Help */}
        <div className="mt-3 text-xs text-gray-500">
          <span>Keyboard shortcuts: </span>
          <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">N</kbd>
          <span> Next Pending, </span>
          <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Shift+N</kbd>
          <span> Previous Pending</span>
        </div>
      </div>
      
      {/* Approvals List */}
      <div ref={listRef} className="space-y-3">
        {sortedApprovals.map((approval, index) => (
          <Card 
            key={approval.id}
            className={`cursor-pointer transition-all duration-200 ${
              index === selectedIndex 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => setSelectedIndex(index)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      Approval #{approval.id}
                    </h3>
                    <Badge>
                      {approval.status}
                    </Badge>
                    <Badge>
                      {approval.urgency}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Created:</span> {new Date(approval.createdAt).toLocaleString()}</p>
                    {approval.updatedAt && (
                      <p><span className="font-medium">Updated:</span> {new Date(approval.updatedAt).toLocaleString()}</p>
                    )}
                    {approval.description && (
                      <p><span className="font-medium">Description:</span> {approval.description}</p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                {approval.status === 'PENDING' && (
                  <div className="flex gap-2 ml-4">
                    <Tooltip label="Approve this request">
                      <Button
                        variant="outline"
                        className="text-green-600 border-green-300 hover:bg-green-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprovalAction(approval.id, 'approve');
                        }}
                        disabled={isProcessing === approval.id}
                      >
                        {isProcessing === approval.id ? 'Processing...' : 'Approve'}
                      </Button>
                    </Tooltip>
                    
                    <Tooltip label="Return this request">
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprovalAction(approval.id, 'return');
                        }}
                        disabled={isProcessing === approval.id}
                      >
                        {isProcessing === approval.id ? 'Processing...' : 'Return'}
                      </Button>
                    </Tooltip>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Footer Actions */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Showing {sortedApprovals.length} of {approvals.length} approvals
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={navigateToPreviousPending}
            disabled={stats.pending === 0}
          >
            ← Previous Pending
          </Button>
          <Button
            variant="outline"
            onClick={navigateToNextPending}
            disabled={stats.pending === 0}
          >
            Next Pending →
          </Button>
          <Button
            variant="outline"
            onClick={onRefresh}
          >
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}
