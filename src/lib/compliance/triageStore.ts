/**
 * Compliance Triage Store - Development Only
 * Client-side store for managing compliance triage items
 * Uses localStorage for persistence with RBAC and audit trail
 */

export interface TriageItem {
  id: string;
  type: 'COMPLIANCE_VIOLATION' | 'AUDIT_FINDING' | 'REGULATORY_ALERT' | 'SECURITY_INCIDENT' | 'DATA_BREACH' | 'PROCESS_DEVIATION';
  status: 'NEW' | 'INVESTIGATING' | 'BLOCKED' | 'RESOLVED';
  title: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  correlationId: string;
  href?: string; // Deep link to related view
  notes?: string;
  slaDeadline?: string;
  tags?: string[];
}

export interface TriageStore {
  items: TriageItem[];
  filters: {
    type?: string;
    severity?: string;
    priority?: string;
    assignedTo?: string;
  };
  lastUpdated: string;
}

export interface TriageAction {
  type: 'MOVE' | 'ANNOTATE' | 'LINK_TO' | 'IMPORT' | 'FILTER' | 'CLEAR';
  itemId?: string;
  payload?: any;
  timestamp: string;
  correlationId: string;
}

// Store key for localStorage
const STORE_KEY = 's3:comp:triage';

// SLA definitions (in hours)
const SLA_DEADLINES = {
  CRITICAL: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 168 // 1 week
};

/**
 * Get triage store from localStorage
 */
export function getTriageStore(): TriageStore {
  if (process.env.NODE_ENV !== 'development') {
    return { items: [], filters: {}, lastUpdated: new Date().toISOString() };
  }

  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load triage store:', error);
  }

  return {
    items: [],
    filters: {},
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Save triage store to localStorage
 */
export function saveTriageStore(store: TriageStore): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  try {
    const updatedStore = {
      ...store,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(updatedStore));
  } catch (error) {
    console.warn('Failed to save triage store:', error);
  }
}

/**
 * Generate unique ID for triage items
 */
function generateTriageId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `triage-${timestamp}-${random}`;
}

/**
 * Generate correlation ID for audit trail
 */
function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `triage-${timestamp}-${random}`;
}

/**
 * Move item to new status
 */
export function moveTriageItem(itemId: string, newStatus: TriageItem['status']): TriageAction {
  const store = getTriageStore();
  const item = store.items.find(i => i.id === itemId);
  
  if (!item) {
    throw new Error(`Triage item ${itemId} not found`);
  }

  const oldStatus = item.status;
  item.status = newStatus;
  item.updatedAt = new Date().toISOString();

  // Update SLA deadline if moving to NEW or INVESTIGATING
  if (newStatus === 'NEW' || newStatus === 'INVESTIGATING') {
    const slaHours = SLA_DEADLINES[item.severity];
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    item.slaDeadline = deadline.toISOString();
  }

  saveTriageStore(store);

  const action: TriageAction = {
    type: 'MOVE',
    itemId,
    payload: { oldStatus, newStatus },
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };

  logTriageAction(action);
  return action;
}

/**
 * Annotate item with note
 */
export function annotateTriageItem(itemId: string, note: string): TriageAction {
  const store = getTriageStore();
  const item = store.items.find(i => i.id === itemId);
  
  if (!item) {
    throw new Error(`Triage item ${itemId} not found`);
  }

  item.notes = note;
  item.updatedAt = new Date().toISOString();

  saveTriageStore(store);

  const action: TriageAction = {
    type: 'ANNOTATE',
    itemId,
    payload: { note },
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };

  logTriageAction(action);
  return action;
}

/**
 * Link item to external view
 */
export function linkTriageItem(itemId: string, href: string): TriageAction {
  const store = getTriageStore();
  const item = store.items.find(i => i.id === itemId);
  
  if (!item) {
    throw new Error(`Triage item ${itemId} not found`);
  }

  item.href = href;
  item.updatedAt = new Date().toISOString();

  saveTriageStore(store);

  const action: TriageAction = {
    type: 'LINK_TO',
    itemId,
    payload: { href },
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };

  logTriageAction(action);
  return action;
}

/**
 * Import items from compliance events
 */
export function importComplianceEvents(events: any[]): TriageAction {
  const store = getTriageStore();
  const newItems: TriageItem[] = [];

  events.forEach(event => {
    const item: TriageItem = {
      id: generateTriageId(),
      type: mapEventTypeToTriageType(event.type),
      status: 'NEW',
      title: event.title || `${event.type} - ${event.warehouseId || 'Unknown Location'}`,
      details: event.details || 'No details available',
      severity: mapEventSeverity(event.severity || 'MEDIUM'),
      priority: mapEventPriority(event.priority || 'MEDIUM'),
      createdAt: event.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      correlationId: event.correlationId || generateCorrelationId(),
      href: event.href,
      tags: event.tags || []
    };

    // Set SLA deadline
    const slaHours = SLA_DEADLINES[item.severity];
    const deadline = new Date(Date.now() + slaHours * 60 * 60 * 1000);
    item.slaDeadline = deadline.toISOString();

    newItems.push(item);
  });

  store.items = [...store.items, ...newItems];
  saveTriageStore(store);

  const action: TriageAction = {
    type: 'IMPORT',
    payload: { importedCount: newItems.length },
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };

  logTriageAction(action);
  return action;
}

/**
 * Apply filters to triage items
 */
export function filterTriageItems(filters: TriageStore['filters']): TriageItem[] {
  const store = getTriageStore();
  let filteredItems = [...store.items];

  if (filters.type) {
    filteredItems = filteredItems.filter(item => item.type === filters.type);
  }

  if (filters.severity) {
    filteredItems = filteredItems.filter(item => item.severity === filters.severity);
  }

  if (filters.priority) {
    filteredItems = filteredItems.filter(item => item.priority === filters.priority);
  }

  if (filters.assignedTo) {
    filteredItems = filteredItems.filter(item => item.assignedTo === filters.assignedTo);
  }

  return filteredItems;
}

/**
 * Clear all triage items
 */
export function clearTriageItems(): TriageAction {
  const store = getTriageStore();
  const itemCount = store.items.length;
  
  store.items = [];
  saveTriageStore(store);

  const action: TriageAction = {
    type: 'CLEAR',
    payload: { clearedCount: itemCount },
    timestamp: new Date().toISOString(),
    correlationId: generateCorrelationId()
  };

  logTriageAction(action);
  return action;
}

/**
 * Get items by status
 */
export function getTriageItemsByStatus(status: TriageItem['status']): TriageItem[] {
  const store = getTriageStore();
  return store.items.filter(item => item.status === status);
}

/**
 * Get triage statistics
 */
export function getTriageStatistics(): {
  total: number;
  byStatus: Record<TriageItem['status'], number>;
  bySeverity: Record<TriageItem['severity'], number>;
  overdue: number;
} {
  const store = getTriageStore();
  const now = new Date();

  const byStatus = store.items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<TriageItem['status'], number>);

  const bySeverity = store.items.reduce((acc, item) => {
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    return acc;
  }, {} as Record<TriageItem['severity'], number>);

  const overdue = store.items.filter(item => {
    if (!item.slaDeadline) return false;
    return new Date(item.slaDeadline) < now && item.status !== 'RESOLVED';
  }).length;

  return {
    total: store.items.length,
    byStatus,
    bySeverity,
    overdue
  };
}

/**
 * Check if item is overdue
 */
export function isTriageItemOverdue(item: TriageItem): boolean {
  if (!item.slaDeadline || item.status === 'RESOLVED') return false;
  return new Date(item.slaDeadline) < new Date();
}

/**
 * Get SLA status for item
 */
export function getTriageItemSlaStatus(item: TriageItem): 'ON_TIME' | 'WARNING' | 'OVERDUE' {
  if (!item.slaDeadline || item.status === 'RESOLVED') return 'ON_TIME';
  
  const deadline = new Date(item.slaDeadline);
  const now = new Date();
  const hoursUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilDeadline < 0) return 'OVERDUE';
  if (hoursUntilDeadline < 2) return 'WARNING';
  return 'ON_TIME';
}

/**
 * Log triage action for audit trail
 */
function logTriageAction(action: TriageAction): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Triage Action:', action);
  }
}

/**
 * Map event type to triage type
 */
function mapEventTypeToTriageType(eventType: string): TriageItem['type'] {
  const typeMap: Record<string, TriageItem['type']> = {
    'COMPLIANCE_VIOLATION': 'COMPLIANCE_VIOLATION',
    'AUDIT_FINDING': 'AUDIT_FINDING',
    'REGULATORY_ALERT': 'REGULATORY_ALERT',
    'SECURITY_INCIDENT': 'SECURITY_INCIDENT',
    'DATA_BREACH': 'DATA_BREACH',
    'PROCESS_DEVIATION': 'PROCESS_DEVIATION'
  };

  return typeMap[eventType] || 'COMPLIANCE_VIOLATION';
}

/**
 * Map event severity to triage severity
 */
function mapEventSeverity(severity: string): TriageItem['severity'] {
  const severityMap: Record<string, TriageItem['severity']> = {
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
    'CRITICAL': 'CRITICAL'
  };

  return severityMap[severity] || 'MEDIUM';
}

/**
 * Map event priority to triage priority
 */
function mapEventPriority(priority: string): TriageItem['priority'] {
  const priorityMap: Record<string, TriageItem['priority']> = {
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
    'URGENT': 'URGENT'
  };

  return priorityMap[priority] || 'MEDIUM';
}

/**
 * Get mock compliance events for development
 */
export function getMockComplianceEvents(): any[] {
  return [
    {
      id: 'event-001',
      type: 'COMPLIANCE_VIOLATION',
      title: 'Safety Protocol Violation - Warehouse A',
      details: 'Employee failed to follow proper safety procedures during equipment operation',
      severity: 'HIGH',
      priority: 'HIGH',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      correlationId: 'corr-001',
      warehouseId: 'WH-A',
      href: '/audit?correlationId=corr-001',
      tags: ['safety', 'warehouse-a']
    },
    {
      id: 'event-002',
      type: 'AUDIT_FINDING',
      title: 'Inventory Discrepancy - SKU-ELEC-001',
      details: 'Physical count shows 5 units but system shows 7 units',
      severity: 'MEDIUM',
      priority: 'MEDIUM',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      correlationId: 'corr-002',
      warehouseId: 'WH-B',
      href: '/audit?correlationId=corr-002',
      tags: ['inventory', 'discrepancy']
    },
    {
      id: 'event-003',
      type: 'SECURITY_INCIDENT',
      title: 'Unauthorized Access Attempt',
      details: 'Multiple failed login attempts detected from suspicious IP address',
      severity: 'CRITICAL',
      priority: 'URGENT',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      correlationId: 'corr-003',
      href: '/audit?correlationId=corr-003',
      tags: ['security', 'access']
    },
    {
      id: 'event-004',
      type: 'REGULATORY_ALERT',
      title: 'Environmental Compliance Check Due',
      details: 'Monthly environmental compliance check is due in 3 days',
      severity: 'LOW',
      priority: 'LOW',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      correlationId: 'corr-004',
      href: '/compliance/checklist',
      tags: ['environmental', 'compliance']
    },
    {
      id: 'event-005',
      type: 'PROCESS_DEVIATION',
      title: 'Quality Control Process Bypass',
      details: 'Product shipped without completing required quality control checks',
      severity: 'HIGH',
      priority: 'HIGH',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      correlationId: 'corr-005',
      warehouseId: 'WH-C',
      href: '/audit?correlationId=corr-005',
      tags: ['quality', 'process']
    }
  ];
}
