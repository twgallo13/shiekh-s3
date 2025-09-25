// src/lib/alerts/bus.ts
'use client';

import { useSyncExternalStore } from 'react';

export type AlertSeverity = 'WARN' | 'CRITICAL';
export type AlertType = 'BudgetThresholdBreached' | 'ComplianceAlert';

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  href?: string;
  correlationId?: string;
  createdAt: number;
  read?: boolean;
}

// --- simple in-memory store (client-only) ---
const MAX_ALERTS = 50;

const store = {
  alerts: [] as Alert[],
  subs: new Set<() => void>(),
  emit(a: Alert) {
    this.alerts = [a, ...this.alerts].slice(0, MAX_ALERTS);
    this.subs.forEach(fn => fn());
  },
  markAllRead() {
    this.alerts = this.alerts.map(a => ({ ...a, read: true }));
    this.subs.forEach(fn => fn());
  },
  subscribe(cb: () => void) {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  },
  snapshot() {
    return {
      list: this.alerts,
      unreadCount: this.alerts.filter(a => !a.read).length,
      markAllRead: () => this.markAllRead(),
    };
  },
};

export function emitAlert(alert: Alert) {
  store.emit(alert);
}

export function useAlerts() {
  return useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
}

export function useFilteredAlerts(role: string) {
  const alerts = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
  
  // Filter alerts based on role
  const filteredAlerts = alerts.list.filter(alert => {
    // Budget alerts visible only to Admin, FM, Cost Analyst
    if (alert.type === 'BudgetThresholdBreached') {
      return ['ADMIN', 'FM', 'COST_ANALYST'].includes(role);
    }
    
    // Compliance alerts visible to all roles
    return true;
  });

  const filteredUnreadCount = filteredAlerts.filter(a => !a.read).length;

  return {
    alerts: filteredAlerts,
    unreadCount: filteredUnreadCount,
    markAsRead: (id: string) => {
      const alert = store.alerts.find(a => a.id === id);
      if (alert) {
        alert.read = true;
        store.subs.forEach(fn => fn());
      }
    },
    markAllRead: () => store.markAllRead(),
    addAlert: (alert: Alert) => store.emit(alert),
  };
}

// Small helper so callers don't have to shape the object every time
export const AlertUtils = {
  createBudgetBreachAlert(
    kpi: { metricId: string; label?: string },
    threshold: number,
    severity: AlertSeverity,
    href?: string
  ): Alert {
    const label = kpi.label ?? kpi.metricId;
    return {
      id: `bb-${kpi.metricId}-${Date.now()}`,
      type: 'BudgetThresholdBreached',
      severity,
      title: `${label}: budget ${severity === 'CRITICAL' ? 'critical' : 'warning'}`,
      message: `Threshold ${threshold}% breached for KPI ${label}.`,
      href,
      createdAt: Date.now(),
    };
  },
};