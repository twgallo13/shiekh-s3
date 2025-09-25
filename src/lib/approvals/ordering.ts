/**
 * Approvals Ordering Utilities
 * Deterministic ordering for approvals with pending-first priority
 */

export interface ApprovalItem {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'RETURNED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string | number;
  updatedAt?: string | number;
  [key: string]: any;
}

export type SortOrder = 'asc' | 'desc';

/**
 * Get urgency priority for sorting (higher number = higher priority)
 */
export function getUrgencyPriority(urgency: string): number {
  switch (urgency) {
    case 'HIGH': return 3;
    case 'MEDIUM': return 2;
    case 'LOW': return 1;
    default: return 0;
  }
}

/**
 * Get status priority for sorting (higher number = higher priority)
 */
export function getStatusPriority(status: string): number {
  switch (status) {
    case 'PENDING': return 3;
    case 'RETURNED': return 2;
    case 'APPROVED': return 1;
    default: return 0;
  }
}

/**
 * Parse date string or number to Date object
 */
export function parseDate(date: string | number): Date {
  if (typeof date === 'number') {
    return new Date(date);
  }
  return new Date(date);
}

/**
 * Sort approvals with deterministic pending-first ordering
 * Priority: status=PENDING desc, then urgency desc, then createdAt asc
 */
export function sortApprovalsPendingFirst(approvals: ApprovalItem[]): ApprovalItem[] {
  return [...approvals].sort((a, b) => {
    // 1. Status priority (PENDING first)
    const statusA = getStatusPriority(a.status);
    const statusB = getStatusPriority(b.status);
    
    if (statusA !== statusB) {
      return statusB - statusA; // Higher priority first (desc)
    }
    
    // 2. Urgency priority (HIGH first)
    const urgencyA = getUrgencyPriority(a.urgency);
    const urgencyB = getUrgencyPriority(b.urgency);
    
    if (urgencyA !== urgencyB) {
      return urgencyB - urgencyA; // Higher priority first (desc)
    }
    
    // 3. Created date (older first for pending items)
    const dateA = parseDate(a.createdAt);
    const dateB = parseDate(b.createdAt);
    
    return dateA.getTime() - dateB.getTime(); // Ascending (older first)
  });
}

/**
 * Sort approvals by a specific field
 */
export function sortApprovalsByField(
  approvals: ApprovalItem[],
  field: keyof ApprovalItem,
  order: SortOrder = 'asc'
): ApprovalItem[] {
  return [...approvals].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle date fields
    if (field === 'createdAt' || field === 'updatedAt') {
      aValue = parseDate(aValue as string | number).getTime();
      bValue = parseDate(bValue as string | number).getTime();
    }
    
    // Handle string fields
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return order === 'asc' ? comparison : -comparison;
    }
    
    // Handle number fields
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return order === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // Fallback to string comparison
    const aStr = String(aValue);
    const bStr = String(bValue);
    const comparison = aStr.localeCompare(bStr);
    return order === 'asc' ? comparison : -comparison;
  });
}

/**
 * Get next pending approval index
 */
export function getNextPendingIndex(
  approvals: ApprovalItem[],
  currentIndex: number
): number {
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');
  
  if (pendingApprovals.length === 0) {
    return -1; // No pending approvals
  }
  
  // Find the next pending approval after current index
  for (let i = currentIndex + 1; i < approvals.length; i++) {
    if (approvals[i].status === 'PENDING') {
      return i;
    }
  }
  
  // Wrap around to the beginning
  for (let i = 0; i < currentIndex; i++) {
    if (approvals[i].status === 'PENDING') {
      return i;
    }
  }
  
  return -1; // No pending approvals found
}

/**
 * Get previous pending approval index
 */
export function getPreviousPendingIndex(
  approvals: ApprovalItem[],
  currentIndex: number
): number {
  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');
  
  if (pendingApprovals.length === 0) {
    return -1; // No pending approvals
  }
  
  // Find the previous pending approval before current index
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (approvals[i].status === 'PENDING') {
      return i;
    }
  }
  
  // Wrap around to the end
  for (let i = approvals.length - 1; i > currentIndex; i--) {
    if (approvals[i].status === 'PENDING') {
      return i;
    }
  }
  
  return -1; // No pending approvals found
}

/**
 * Get all pending approval indices
 */
export function getPendingIndices(approvals: ApprovalItem[]): number[] {
  return approvals
    .map((approval, index) => ({ approval, index }))
    .filter(({ approval }) => approval.status === 'PENDING')
    .map(({ index }) => index);
}

/**
 * Get approval statistics
 */
export function getApprovalStats(approvals: ApprovalItem[]): {
  total: number;
  pending: number;
  approved: number;
  returned: number;
  highUrgency: number;
  mediumUrgency: number;
  lowUrgency: number;
} {
  const stats = {
    total: approvals.length,
    pending: 0,
    approved: 0,
    returned: 0,
    highUrgency: 0,
    mediumUrgency: 0,
    lowUrgency: 0,
  };
  
  approvals.forEach(approval => {
    // Status counts
    switch (approval.status) {
      case 'PENDING':
        stats.pending++;
        break;
      case 'APPROVED':
        stats.approved++;
        break;
      case 'RETURNED':
        stats.returned++;
        break;
    }
    
    // Urgency counts
    switch (approval.urgency) {
      case 'HIGH':
        stats.highUrgency++;
        break;
      case 'MEDIUM':
        stats.mediumUrgency++;
        break;
      case 'LOW':
        stats.lowUrgency++;
        break;
    }
  });
  
  return stats;
}

/**
 * Filter approvals by status
 */
export function filterByStatus(
  approvals: ApprovalItem[],
  status: ApprovalItem['status']
): ApprovalItem[] {
  return approvals.filter(approval => approval.status === status);
}

/**
 * Filter approvals by urgency
 */
export function filterByUrgency(
  approvals: ApprovalItem[],
  urgency: ApprovalItem['urgency']
): ApprovalItem[] {
  return approvals.filter(approval => approval.urgency === urgency);
}

/**
 * Filter approvals by multiple criteria
 */
export function filterApprovals(
  approvals: ApprovalItem[],
  filters: {
    status?: ApprovalItem['status'];
    urgency?: ApprovalItem['urgency'];
    dateRange?: {
      start: Date;
      end: Date;
    };
  }
): ApprovalItem[] {
  return approvals.filter(approval => {
    // Status filter
    if (filters.status && approval.status !== filters.status) {
      return false;
    }
    
    // Urgency filter
    if (filters.urgency && approval.urgency !== filters.urgency) {
      return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const approvalDate = parseDate(approval.createdAt);
      if (approvalDate < filters.dateRange.start || approvalDate > filters.dateRange.end) {
        return false;
      }
    }
    
    return true;
  });
}

/**
 * Get approval by ID
 */
export function getApprovalById(
  approvals: ApprovalItem[],
  id: string
): ApprovalItem | undefined {
  return approvals.find(approval => approval.id === id);
}

/**
 * Get approval index by ID
 */
export function getApprovalIndexById(
  approvals: ApprovalItem[],
  id: string
): number {
  return approvals.findIndex(approval => approval.id === id);
}
