"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { useRole } from "@/components/providers/RoleProvider";
import { useToast } from "@/components/ui/ToastHost";
import { 
  generateVendorSplitProposal, 
  validateVendorSplitProposal,
  getAllVendors,
  getVendorById,
  calculateVendorChangeImpact,
  type OrderLine,
  type VendorSplitProposal,
  type VendorSplitGroup
} from "@/lib/orders/vendorSplit";
import { useMfaModal } from "@/components/ui/MfaModal";
import { useHttpClient } from "@/lib/client/http";

interface VendorSplitProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderLines: OrderLine[];
}

/**
 * Vendor Split Modal - Development Only
 * Allows splitting orders across vendors with MFA-gated overrides
 * Role-scoped cost visibility and unsaved changes guard
 */
export default function VendorSplit({ isOpen, onClose, orderId, orderLines }: VendorSplitProps) {
  const { effectiveRole } = useRole();
  const toast = useToast();
  const { showMfaModal } = useMfaModal();
  const httpClient = useHttpClient();
  
  const [proposal, setProposal] = useState<VendorSplitProposal | null>(null);
  const [modifiedGroups, setModifiedGroups] = useState<VendorSplitGroup[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if user can see costs
  const canSeeCosts = ['ADMIN', 'FM', 'COST_ANALYST'].includes(effectiveRole);
  
  // Check if user can override
  const canOverride = ['FM', 'ADMIN'].includes(effectiveRole);

  // Generate initial proposal
  useEffect(() => {
    if (isOpen && orderLines.length > 0) {
      try {
        const initialProposal = generateVendorSplitProposal(orderLines);
        setProposal(initialProposal);
        setModifiedGroups([...initialProposal.splitGroups]);
        setHasUnsavedChanges(false);
      } catch (error) {
        toast({
          kind: 'error',
          text: 'Failed to generate vendor split proposal'
        });
        console.error('Vendor split error:', error);
      }
    }
  }, [isOpen, orderLines, toast]);

  // Handle vendor change for a group
  const handleVendorChange = useCallback((groupIndex: number, newVendorId: string) => {
    if (!proposal) return;

    const newVendor = getVendorById(newVendorId);
    if (!newVendor) return;

    const updatedGroups = [...modifiedGroups];
    const group = updatedGroups[groupIndex];
    
    // Calculate impact of the change
    const impact = calculateVendorChangeImpact(group, newVendorId);
    
    // Update the group
    updatedGroups[groupIndex] = {
      ...group,
      vendorId: newVendor.id,
      vendorName: newVendor.name,
      leadTimeDays: newVendor.leadTimeDays,
      landedCost: group.landedCost + impact.costChange,
      rationale: impact.impact
    };

    setModifiedGroups(updatedGroups);
    setHasUnsavedChanges(true);
  }, [proposal, modifiedGroups]);

  // Handle unsaved changes guard
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
      }
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  // Handle apply split with MFA
  const handleApplySplit = useCallback(async () => {
    if (!proposal || !canOverride) return;

    try {
      setSubmitting(true);

      // Show MFA modal
      const mfaResult = await showMfaModal({
        action: 'VENDOR_OVERRIDE',
        reasonCode: 'VENDOR_SPLIT_APPLY',
        correlationId: `vendor-split-${orderId}-${Date.now()}`
      });

      if (!mfaResult.success) {
        toast({
          kind: 'error',
          text: 'MFA verification failed'
        });
        return;
      }

      // Validate the modified proposal
      const modifiedProposal = {
        ...proposal,
        splitGroups: modifiedGroups
      };

      const validation = validateVendorSplitProposal(modifiedProposal);
      if (!validation.valid) {
        toast({
          kind: 'error',
          text: `Validation failed: ${validation.errors.join(', ')}`
        });
        return;
      }

      // Log the intended payload (dev-only)
      const payload = {
        orderId,
        correlationId: mfaResult.correlationId,
        reasonCode: 'VENDOR_SPLIT_APPLY',
        originalProposal: proposal,
        modifiedProposal,
        summary: {
          totalGroups: modifiedGroups.length,
          totalSavings: modifiedProposal.totalSavings,
          averageLeadTime: modifiedProposal.averageLeadTime
        }
      };

      console.log('Vendor Split Override Payload:', payload);

      // In a real implementation, this would make an API call
      // For now, we just log and show success
      toast({
        kind: 'ok',
        text: 'Vendor split applied successfully (dev mode)'
      });

      onClose();
    } catch (error) {
      toast({
        kind: 'error',
        text: 'Failed to apply vendor split'
      });
      console.error('Vendor split apply error:', error);
    } finally {
      setSubmitting(false);
    }
  }, [proposal, modifiedGroups, canOverride, orderId, showMfaModal, toast, onClose]);

  // Calculate summary statistics
  const summary = proposal ? {
    totalSavings: modifiedGroups.reduce((sum, group) => sum + group.landedCost, 0) - 
                  proposal.originalLines.reduce((sum, line) => sum + (line.unitCost || 0) * line.qty, 0),
    averageLeadTime: modifiedGroups.reduce((sum, group) => sum + group.leadTimeDays, 0) / modifiedGroups.length,
    totalGroups: modifiedGroups.length
  } : null;

  if (process.env.NODE_ENV !== 'development') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Vendor Split">
        <div className="p-6 text-center">
          <p className="text-gray-600">Vendor Split is only available in development mode.</p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Vendor Split" size="large">
      <div className="p-6 space-y-6">
        {/* Summary */}
        {summary && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Split Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Groups:</span>
                  <span className="ml-2">{summary.totalGroups}</span>
                </div>
                {canSeeCosts && (
                  <div>
                    <span className="font-medium">Total Savings:</span>
                    <span className={`ml-2 ${summary.totalSavings > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${summary.totalSavings.toFixed(2)}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Avg Lead Time:</span>
                  <span className="ml-2">{summary.averageLeadTime.toFixed(1)} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor Groups Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vendor Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modifiedGroups.map((group, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-blue-100 text-blue-800">
                        Group {index + 1}
                      </Badge>
                      <span className="font-medium">{group.vendorName}</span>
                      <Badge className="bg-gray-100 text-gray-800">
                        {group.leadTimeDays} days
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={group.vendorId}
                        onChange={(e) => handleVendorChange(index, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        {getAllVendors().map(vendor => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.name} ({vendor.leadTimeDays}d)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Lines:</span>
                      <span className="ml-2">{group.lines.length}</span>
                    </div>
                    <div>
                      <span className="font-medium">Total Qty:</span>
                      <span className="ml-2">{group.totalQuantity}</span>
                    </div>
                    {canSeeCosts && (
                      <>
                        <div>
                          <span className="font-medium">Total Cost:</span>
                          <span className="ml-2">${group.totalCost.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Landed Cost:</span>
                          <span className="ml-2">${group.landedCost.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-2">
                    <span className="text-xs text-gray-600">Rationale: {group.rationale}</span>
                  </div>
                  
                  {/* Line Items */}
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Line Items:</div>
                    <div className="space-y-1">
                      {group.lines.map((line, lineIndex) => (
                        <div key={lineIndex} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                          <span>{line.sku} - {line.description}</span>
                          <span>Qty: {line.qty}</span>
                          {canSeeCosts && line.unitCost && (
                            <span>${(line.unitCost * line.qty).toFixed(2)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-600">
            {hasUnsavedChanges && (
              <span className="text-orange-600">• Unsaved changes</span>
            )}
            {!canSeeCosts && (
              <span>• Cost information hidden (insufficient permissions)</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {canOverride ? (
              <Button 
                onClick={handleApplySplit}
                disabled={submitting || !hasUnsavedChanges}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {submitting ? 'Applying...' : 'Apply Split (Override)'}
              </Button>
            ) : (
              <Button disabled className="bg-gray-400">
                Override Not Allowed
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
