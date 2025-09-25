/**
 * Sticky Filters Hook
 * Persists and restores filter state via localStorage with role-based keys
 * Used for approvals filtering with deep linking support
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export interface ApprovalFilters {
  status?: 'PENDING' | 'APPROVED' | 'RETURNED';
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface StickyFiltersState {
  filters: ApprovalFilters;
  setFilters: (filters: ApprovalFilters) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  getFilterChips: () => Array<{ key: string; label: string; value: string; onRemove: () => void }>;
}

/**
 * Hook for managing sticky filters with localStorage persistence and URL deep linking
 */
export function useStickyFilters(role: string): StickyFiltersState {
  const [searchParams, setSearchParams] = useSearchParams();
  const router = useRouter();
  
  // Generate localStorage key based on role
  const storageKey = `s3:approvals:filters:${role}`;
  
  // Initialize filters from URL params or localStorage
  const getInitialFilters = useCallback((): ApprovalFilters => {
    // First try URL params
    const urlStatus = searchParams.get('status') as ApprovalFilters['status'];
    const urlUrgency = searchParams.get('urgency') as ApprovalFilters['urgency'];
    
    if (urlStatus || urlUrgency) {
      return {
        status: urlStatus || undefined,
        urgency: urlUrgency || undefined,
      };
    }
    
    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ApprovalFilters;
        return {
          status: parsed.status || undefined,
          urgency: parsed.urgency || undefined,
        };
      }
    } catch (error) {
      console.warn('Failed to parse stored filters:', error);
    }
    
    return {};
  }, [searchParams, storageKey]);
  
  const [filters, setFiltersState] = useState<ApprovalFilters>(getInitialFilters);
  
  // Update URL when filters change
  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Clear existing filter params
    newSearchParams.delete('status');
    newSearchParams.delete('urgency');
    
    // Add new filter params
    if (filters.status) {
      newSearchParams.set('status', filters.status);
    }
    if (filters.urgency) {
      newSearchParams.set('urgency', filters.urgency);
    }
    
    // Update URL if params changed
    const newParamsString = newSearchParams.toString();
    const currentParamsString = searchParams.toString();
    
    if (newParamsString !== currentParamsString) {
      const newUrl = newParamsString ? `?${newParamsString}` : window.location.pathname;
      router.replace(newUrl, { scroll: false });
    }
  }, [filters, searchParams, router]);
  
  // Persist to localStorage when filters change
  useEffect(() => {
    try {
      if (Object.keys(filters).length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(filters));
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn('Failed to persist filters:', error);
    }
  }, [filters, storageKey]);
  
  // Sync with URL params when they change externally
  useEffect(() => {
    const urlStatus = searchParams.get('status') as ApprovalFilters['status'];
    const urlUrgency = searchParams.get('urgency') as ApprovalFilters['urgency'];
    
    const urlFilters: ApprovalFilters = {
      status: urlStatus || undefined,
      urgency: urlUrgency || undefined,
    };
    
    // Only update if different from current state
    if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
      setFiltersState(urlFilters);
    }
  }, [searchParams, filters]);
  
  const setFilters = useCallback((newFilters: ApprovalFilters) => {
    setFiltersState(newFilters);
  }, []);
  
  const clearFilters = useCallback(() => {
    setFiltersState({});
  }, []);
  
  const hasActiveFilters = Object.keys(filters).length > 0;
  
  const getFilterChips = useCallback(() => {
    const chips: Array<{ key: string; label: string; value: string; onRemove: () => void }> = [];
    
    if (filters.status) {
      chips.push({
        key: 'status',
        label: 'Status',
        value: filters.status,
        onRemove: () => setFilters({ ...filters, status: undefined }),
      });
    }
    
    if (filters.urgency) {
      chips.push({
        key: 'urgency',
        label: 'Urgency',
        value: filters.urgency,
        onRemove: () => setFilters({ ...filters, urgency: undefined }),
      });
    }
    
    return chips;
  }, [filters, setFilters]);
  
  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    getFilterChips,
  };
}

/**
 * Utility function to apply filters to approval data
 */
export function applyApprovalFilters(
  approvals: any[],
  filters: ApprovalFilters
): any[] {
  return approvals.filter(approval => {
    // Status filter
    if (filters.status && approval.status !== filters.status) {
      return false;
    }
    
    // Urgency filter
    if (filters.urgency && approval.urgency !== filters.urgency) {
      return false;
    }
    
    return true;
  });
}

/**
 * Utility function to get filter counts
 */
export function getFilterCounts(approvals: any[]): {
  pending: number;
  approvedToday: number;
  returnedToday: number;
  total: number;
} {
  const today = new Date().toDateString();
  
  const pending = approvals.filter(a => a.status === 'PENDING').length;
  const approvedToday = approvals.filter(a => 
    a.status === 'APPROVED' && new Date(a.updatedAt).toDateString() === today
  ).length;
  const returnedToday = approvals.filter(a => 
    a.status === 'RETURNED' && new Date(a.updatedAt).toDateString() === today
  ).length;
  
  return {
    pending,
    approvedToday,
    returnedToday,
    total: approvals.length,
  };
}

/**
 * Utility function to get status color
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING': return 'text-yellow-600 bg-yellow-100';
    case 'APPROVED': return 'text-green-600 bg-green-100';
    case 'RETURNED': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Utility function to get urgency color
 */
export function getUrgencyColor(urgency: string): string {
  switch (urgency) {
    case 'HIGH': return 'text-red-600 bg-red-100';
    case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
    case 'LOW': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}
