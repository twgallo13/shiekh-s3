"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { HighRiskAction, getActionDescription, getRiskLevel, getRequiredReasonCodes, validateOtp } from "@/lib/security/highRisk";

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otp: string, reasonCode: string) => void;
  action: HighRiskAction;
  loading?: boolean;
  error?: string | null;
}

/**
 * MFA Modal Component
 * Secure modal for high-risk actions requiring MFA
 * Accessibility: labelled dialog, focus trap, ESC close, error text region
 */
export default function MfaModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  loading = false,
  error = null
}: MfaModalProps) {
  const [otp, setOtp] = useState("");
  const [reasonCode, setReasonCode] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [reasonError, setReasonError] = useState<string | null>(null);
  
  const otpInputRef = useRef<HTMLInputElement>(null);
  const reasonInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Development auto-fill
  const isDevAutoFill = process.env.NODE_ENV === "development" && 
    typeof window !== "undefined" && 
    localStorage.getItem("dev:mfa:auto") === "1";

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setOtp("");
      setReasonCode("");
      setOtpError(null);
      setReasonError(null);
      
      // Auto-fill in development
      if (isDevAutoFill) {
        setOtp("123456");
        setReasonCode(getRequiredReasonCodes(action)[0]);
      }
      
      // Focus first input
      setTimeout(() => {
        if (otpInputRef.current) {
          otpInputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, action, isDevAutoFill]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'input, button, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setOtpError(null);
  };

  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setReasonCode(e.target.value);
    setReasonError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate OTP
    if (!validateOtp(otp)) {
      setOtpError("OTP must be exactly 6 digits");
      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
      return;
    }

    // Validate reason code
    if (!reasonCode) {
      setReasonError("Please select a reason code");
      if (reasonInputRef.current) {
        reasonInputRef.current.focus();
      }
      return;
    }

    onConfirm(otp, reasonCode);
  };

  const actionDescription = getActionDescription(action);
  const riskLevel = getRiskLevel(action);
  const requiredReasonCodes = getRequiredReasonCodes(action);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        role="dialog"
        aria-labelledby="mfa-modal-title"
        aria-describedby="mfa-modal-description"
        aria-modal="true"
      >
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <CardTitle id="mfa-modal-title" className="text-lg flex items-center gap-2">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              Multi-Factor Authentication Required
            </CardTitle>
            <p id="mfa-modal-description" className="text-sm text-gray-600">
              {actionDescription} requires additional verification due to {riskLevel} risk level.
            </p>
          </CardHeader>
          
          <CardContent className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* OTP Input */}
              <div>
                <label htmlFor="otp-input" className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password (6 digits)
                </label>
                <input
                  ref={otpInputRef}
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="123456"
                  className={`w-full border rounded px-3 py-2 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    otpError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  maxLength={6}
                  aria-describedby={otpError ? "otp-error" : undefined}
                  aria-invalid={otpError ? "true" : "false"}
                />
                {otpError && (
                  <p id="otp-error" className="text-sm text-red-600 mt-1" role="alert">
                    {otpError}
                  </p>
                )}
                {isDevAutoFill && (
                  <p className="text-xs text-blue-600 mt-1">
                    Development mode: Auto-filled for testing
                  </p>
                )}
              </div>

              {/* Reason Code Selection */}
              <div>
                <label htmlFor="reason-code" className="block text-sm font-medium text-gray-700 mb-2">
                  Reason Code *
                </label>
                <select
                  ref={reasonInputRef}
                  id="reason-code"
                  value={reasonCode}
                  onChange={handleReasonChange}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    reasonError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  aria-describedby={reasonError ? "reason-error" : undefined}
                  aria-invalid={reasonError ? "true" : "false"}
                >
                  <option value="">Select a reason code</option>
                  {requiredReasonCodes.map((code) => (
                    <option key={code} value={code}>
                      {code.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                {reasonError && (
                  <p id="reason-error" className="text-sm text-red-600 mt-1" role="alert">
                    {reasonError}
                  </p>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700" role="alert">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <p className="font-medium">Authentication Failed</p>
                      <p className="text-xs mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-yellow-800">Security Notice</p>
                    <p className="text-yellow-700 text-xs mt-1">
                      This action will be logged for audit purposes. Your OTP will expire in 10 minutes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading || !otp || !reasonCode}
                  className="flex-1"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Verifying...
                    </div>
                  ) : (
                    'Confirm Action'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * Hook for managing MFA modal state
 */
export function useMfaModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<HighRiskAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openMfaModal = (mfaAction: HighRiskAction) => {
    setAction(mfaAction);
    setError(null);
    setIsOpen(true);
  };

  const closeMfaModal = () => {
    setIsOpen(false);
    setAction(null);
    setError(null);
    setLoading(false);
  };

  const setMfaLoading = (loading: boolean) => {
    setLoading(loading);
  };

  const setMfaError = (error: string | null) => {
    setError(error);
  };

  return {
    isOpen,
    action,
    loading,
    error,
    openMfaModal,
    closeMfaModal,
    setMfaLoading,
    setMfaError
  };
}
