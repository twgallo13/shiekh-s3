"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFilteredAlerts, type Alert } from "@/lib/alerts/bus";
import { useRole } from "@/components/providers/RoleProvider";

interface ToastHostProps {
  className?: string;
}

/**
 * ToastHost Component
 * Top-right toast notifications with auto-dismiss and accessibility
 * Caps at 3 visible toasts, auto-dismisses after 8s unless CRITICAL
 */
export default function ToastHost({ className = "" }: ToastHostProps) {
  const router = useRouter();
  const { effectiveRole } = useRole();
  const { alerts, markAsRead } = useFilteredAlerts(effectiveRole);
  const [visibleToasts, setVisibleToasts] = useState<Alert[]>([]);
  const [dismissedToasts, setDismissedToasts] = useState<Set<string>>(new Set());

  // Filter to show only unread alerts, max 3 visible
  useEffect(() => {
    const unreadAlerts = alerts.filter(alert => !alert.read && !dismissedToasts.has(alert.id));
    setVisibleToasts(unreadAlerts.slice(0, 3));
  }, [alerts, dismissedToasts]);

  // Auto-dismiss toasts after 8 seconds (unless CRITICAL)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleToasts.forEach(toast => {
      if (toast.severity !== 'CRITICAL') {
        const timer = setTimeout(() => {
          handleDismiss(toast.id);
        }, 8000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleToasts]);

  const handleDismiss = (toastId: string) => {
    setDismissedToasts(prev => new Set([...prev, toastId]));
    markAsRead(toastId);
  };

  const handleViewDetails = (toast: Alert) => {
    markAsRead(toast.id);
    setDismissedToasts(prev => new Set([...prev, toast.id]));
    
    if (toast.href) {
      router.push(toast.href);
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          button: 'bg-red-100 hover:bg-red-200 text-red-800'
        };
      case 'WARN':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500',
          button: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-500',
          button: 'bg-blue-100 hover:bg-blue-200 text-blue-800'
        };
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'WARN':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (visibleToasts.length === 0) {
    return null;
  }

  return (
    <div 
      className={`fixed top-4 right-4 z-50 space-y-2 ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Alert notifications"
    >
      {visibleToasts.map((toast) => {
        const styles = getSeverityStyles(toast.severity);
        
        return (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white border rounded-lg shadow-lg p-4 ${styles.container} transition-all duration-300 ease-in-out`}
            role="alert"
            aria-labelledby={`toast-title-${toast.id}`}
            aria-describedby={`toast-message-${toast.id}`}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {getSeverityIcon(toast.severity)}
              </div>
              
              <div className="ml-3 flex-1">
                <h4 
                  id={`toast-title-${toast.id}`}
                  className="text-sm font-medium"
                >
                  {toast.title}
                </h4>
                
                <p 
                  id={`toast-message-${toast.id}`}
                  className="mt-1 text-sm opacity-90"
                >
                  {toast.message}
                </p>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex space-x-2">
                    {toast.href && (
                      <button
                        onClick={() => handleViewDetails(toast)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${styles.button}`}
                        aria-label={`View details for ${toast.title}`}
                      >
                        View Details
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDismiss(toast.id)}
                      className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      aria-label={`Dismiss ${toast.title}`}
                    >
                      Dismiss
                    </button>
                  </div>
                  
                  {toast.severity === 'CRITICAL' && (
                    <span className="text-xs font-medium opacity-75">
                      No auto-dismiss
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Hook for programmatic toast control
 */
export function useToast() {
  const { addAlert } = useFilteredAlerts('ADMIN'); // Use admin role for programmatic toasts
  
  const showToast = (toastData: {
    kind: 'ok' | 'err';
    text: string;
    title?: string;
    href?: string;
  }) => {
    const severity = toastData.kind === 'err' ? 'CRITICAL' : 'WARN';
    const type = toastData.kind === 'err' ? 'ComplianceAlert' : 'ComplianceAlert';
    
    addAlert({
      type,
      severity,
      title: toastData.title || (toastData.kind === 'err' ? 'Error' : 'Success'),
      message: toastData.text,
      href: toastData.href
    });
  };

  return showToast;
}