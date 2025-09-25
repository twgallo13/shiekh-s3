"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import MfaModal, { useMfaModal } from "@/components/ui/MfaModal";
import { 
  HighRiskAction, 
  requiresMfa, 
  getActionDescription, 
  getRiskLevel,
  annotateMfaHeaders,
  generateCorrelationId
} from "@/lib/security/highRisk";
import { 
  createMfaRequest, 
  isMfaRequiredError, 
  MfaRequiredError,
  ErrorLike 
} from "@/lib/client/http";
import { useToast } from "@/components/ui/ToastHost";
import { useRole } from "@/components/providers/RoleProvider";

interface ActionButtonsProps {
  actions: Array<{
    id: string;
    action: HighRiskAction;
    label: string;
    variant?: 'default' | 'outline' | 'destructive';
    disabled?: boolean;
    endpoint: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    payload?: any;
  }>;
  onSuccess?: (actionId: string, response: any) => void;
  onError?: (actionId: string, error: ErrorLike) => void;
  className?: string;
}

/**
 * Action Buttons Component
 * Handles high-risk actions with MFA flow
 * Used by orders/variances views and other high-risk operations
 */
export default function ActionButtons({
  actions,
  onSuccess,
  onError,
  className = ""
}: ActionButtonsProps) {
  const { effectiveRole } = useRole();
  const toast = useToast();
  const {
    isOpen,
    action: currentAction,
    loading,
    error,
    openMfaModal,
    closeMfaModal,
    setMfaLoading,
    setMfaError
  } = useMfaModal();

  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});

  // Development auto-fill check
  const isDevAutoFill = process.env.NODE_ENV === "development" && 
    typeof window !== "undefined" && 
    localStorage.getItem("dev:mfa:auto") === "1";

  const handleActionClick = (actionConfig: ActionButtonsProps['actions'][0]) => {
    const { action, id } = actionConfig;

    // Check if MFA is required
    if (requiresMfa(action)) {
      openMfaModal(action);
    } else {
      // Execute action directly if no MFA required
      executeAction(actionConfig, null);
    }
  };

  const executeAction = async (
    actionConfig: ActionButtonsProps['actions'][0],
    mfaContext: { otp: string; reasonCode: string } | null
  ) => {
    const { id, endpoint, method, payload } = actionConfig;
    
    setActionStates(prev => ({ ...prev, [id]: true }));
    setMfaLoading(true);
    setMfaError(null);

    try {
      const correlationId = generateCorrelationId();
      let response;

      if (mfaContext) {
        // Execute with MFA headers
        const mfaHeaders = annotateMfaHeaders('user-token', mfaContext.otp);
        response = await createMfaRequest(endpoint, method, payload, mfaHeaders);
      } else {
        // Execute without MFA
        const { getHttpClient } = await import('@/lib/client/http');
        const client = getHttpClient();
        
        switch (method) {
          case 'GET':
            response = await client.get(endpoint);
            break;
          case 'POST':
            response = await client.post(endpoint, payload);
            break;
          case 'PUT':
            response = await client.put(endpoint, payload);
            break;
          case 'PATCH':
            response = await client.patch(endpoint, payload);
            break;
          case 'DELETE':
            response = await client.delete(endpoint);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }
      }

      // Success
      const actionDescription = getActionDescription(actionConfig.action);
      toast({
        kind: 'ok',
        title: 'Action Approved',
        text: `${actionDescription} completed successfully`
      });

      onSuccess?.(id, response.data);
      closeMfaModal();

    } catch (error) {
      console.error('Action execution failed:', error);

      // Handle MFA required error
      if (isMfaRequiredError(error)) {
        setMfaError('MFA verification failed. Please try again.');
        return;
      }

      // Handle other errors
      const errorLike = error as ErrorLike;
      const actionDescription = getActionDescription(actionConfig.action);
      
      toast({
        kind: 'err',
        title: 'Action Failed',
        text: `${actionDescription} failed: ${errorLike.message}`
      });

      onError?.(id, errorLike);
      closeMfaModal();

    } finally {
      setActionStates(prev => ({ ...prev, [id]: false }));
      setMfaLoading(false);
    }
  };

  const handleMfaConfirm = (otp: string, reasonCode: string) => {
    const actionConfig = actions.find(a => a.action === currentAction);
    if (actionConfig) {
      executeAction(actionConfig, { otp, reasonCode });
    }
  };

  const getButtonVariant = (action: HighRiskAction, variant?: string) => {
    if (variant) return variant;
    
    const riskLevel = getRiskLevel(action);
    return riskLevel === 'CRITICAL' ? 'destructive' : 'default';
  };

  const getButtonIcon = (action: HighRiskAction) => {
    switch (action) {
      case HighRiskAction.APPROVE_ORDER:
      case HighRiskAction.APPROVE_VARIANCE:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case HighRiskAction.RETURN_ORDER:
      case HighRiskAction.RETURN_VARIANCE:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case HighRiskAction.VENDOR_OVERRIDE:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`flex gap-2 ${className}`}>
        {actions.map((actionConfig) => {
          const { id, action, label, disabled } = actionConfig;
          const isLoading = actionStates[id] || false;
          const variant = getButtonVariant(action, actionConfig.variant);
          const icon = getButtonIcon(action);
          const riskLevel = getRiskLevel(action);

          return (
            <Button
              key={id}
              variant={variant as any}
              disabled={disabled || isLoading}
              onClick={() => handleActionClick(actionConfig)}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                icon
              )}
              {label}
              {requiresMfa(action) && (
                <span className="text-xs opacity-75">
                  ({riskLevel} RISK)
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* MFA Modal */}
      {isOpen && currentAction && (
        <MfaModal
          isOpen={isOpen}
          onClose={closeMfaModal}
          onConfirm={handleMfaConfirm}
          action={currentAction}
          loading={loading}
          error={error}
        />
      )}

      {/* Development Notice */}
      {isDevAutoFill && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Development Mode: MFA auto-fill enabled. Set localStorage["dev:mfa:auto"] = "0" to disable.
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Hook for managing action button state
 */
export function useActionButtons() {
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({});

  const setActionLoading = (actionId: string, loading: boolean) => {
    setActionStates(prev => ({ ...prev, [actionId]: loading }));
  };

  const isActionLoading = (actionId: string) => {
    return actionStates[actionId] || false;
  };

  return {
    actionStates,
    setActionLoading,
    isActionLoading
  };
}

/**
 * Predefined action configurations for common use cases
 */
export const COMMON_ACTIONS = {
  APPROVE_ORDER: {
    id: 'approve-order',
    action: HighRiskAction.APPROVE_ORDER,
    label: 'Approve Order',
    endpoint: '/api/orders/approve',
    method: 'POST' as const,
  },
  RETURN_ORDER: {
    id: 'return-order',
    action: HighRiskAction.RETURN_ORDER,
    label: 'Return Order',
    variant: 'destructive' as const,
    endpoint: '/api/orders/return',
    method: 'POST' as const,
  },
  APPROVE_VARIANCE: {
    id: 'approve-variance',
    action: HighRiskAction.APPROVE_VARIANCE,
    label: 'Approve Variance',
    endpoint: '/api/variances/approve',
    method: 'POST' as const,
  },
  RETURN_VARIANCE: {
    id: 'return-variance',
    action: HighRiskAction.RETURN_VARIANCE,
    label: 'Return Variance',
    variant: 'destructive' as const,
    endpoint: '/api/variances/return',
    method: 'POST' as const,
  },
  VENDOR_OVERRIDE: {
    id: 'vendor-override',
    action: HighRiskAction.VENDOR_OVERRIDE,
    label: 'Vendor Override',
    variant: 'destructive' as const,
    endpoint: '/api/vendors/override',
    method: 'POST' as const,
  },
  VENDOR_SPLIT: {
    id: 'vendor-split',
    action: HighRiskAction.VENDOR_OVERRIDE,
    label: 'Vendor Split',
    variant: 'default' as const,
    endpoint: '/api/orders/vendor-split',
    method: 'POST' as const,
  }
};
