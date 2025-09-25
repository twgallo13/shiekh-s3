'use client';
import { useSyncExternalStore } from 'react';

export type AlertSeverity = 'WARN' | 'CRITICAL';
export type AlertType = 'BudgetThresholdBreached' | 'ComplianceAlert';
export interface Alert {
  id: string; type: AlertType; severity: AlertSeverity;
  title: string; message: string; href?: string; correlationId?: string;
  createdAt: number; read?: boolean;
}

const MAX = 50;
const store = {
  alerts: [] as Alert[],
  subs: new Set<() => void>(),
  emit(a: Alert){ this.alerts=[a,...this.alerts].slice(0,MAX); this.subs.forEach(f=>f()); },
  markAllRead(){ this.alerts=this.alerts.map(a=>({...a,read:true})); this.subs.forEach(f=>f()); },
  subscribe(cb:()=>void){ this.subs.add(cb); return ()=>this.subs.delete(cb); },
  snapshot(){ return { list:this.alerts, unreadCount:this.alerts.filter(a=>!a.read).length, markAllRead:()=>this.markAllRead() }; },
};

export function emitAlert(a: Alert){ store.emit(a); }
export function useAlerts(){ return useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot); }

export const AlertUtils = {
  createBudgetBreachAlert(
    kpi: { metricId: string; label?: string },
    threshold: number,
    severity: AlertSeverity,
    href?: string
  ): Alert {
    const label = kpi.label ?? kpi.metricId;
    return {
      id:`bb-${kpi.metricId}-${Date.now()}`, type:'BudgetThresholdBreached', severity,
      title:`${label}: budget ${severity==='CRITICAL'?'critical':'warning'}`,
      message:`Threshold ${threshold}% breached for KPI ${label}.`,
      href, createdAt: Date.now(),
    };
  },
};