/**
 * KPI Registry - Role-aware KPI definitions following §11 specification
 * Provides client-side mock KPIs with threshold configurations
 * Supports development-only threshold overrides via localStorage
 * Emits budget-breach alerts when thresholds are crossed
 */

export interface KpiThreshold {
  target: number;
  warn: number;
  critical: number;
}

export interface KpiDefinition {
  metricId: string;
  label: string;
  value: number;
  unit: string;
  roleVisibility: string[];
  threshold: KpiThreshold;
  trend?: 'up' | 'down' | 'stable';
  sparkline?: number[];
}

export type Role = 'SM' | 'DM' | 'FM' | 'ADMIN' | 'COST_ANALYST' | 'WHS' | 'AM';

export interface KpiOverrides {
  [metricId: string]: KpiThreshold;
}

/**
 * Load KPI threshold overrides from localStorage (dev-only)
 */
export function loadKpiOverrides(): KpiOverrides {
  if (process.env.NODE_ENV !== 'development') {
    return {};
  }
  
  try {
    const stored = localStorage.getItem('dev:kpiThresholds');
    if (stored) {
      return JSON.parse(stored) as KpiOverrides;
    }
  } catch (error) {
    console.warn('Failed to load KPI overrides:', error);
  }
  
  return {};
}

/**
 * Save KPI threshold overrides to localStorage (dev-only)
 */
export function saveKpiOverrides(overrides: KpiOverrides): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  try {
    localStorage.setItem('dev:kpiThresholds', JSON.stringify(overrides));
  } catch (error) {
    console.warn('Failed to save KPI overrides:', error);
  }
}

/**
 * Clear KPI threshold overrides (dev-only)
 */
export function clearKpiOverrides(): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  try {
    localStorage.removeItem('dev:kpiThresholds');
  } catch (error) {
    console.warn('Failed to clear KPI overrides:', error);
  }
}

/**
 * Check if KPI has threshold overrides
 */
export function hasKpiOverrides(metricId: string): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }
  
  const overrides = loadKpiOverrides();
  return metricId in overrides;
}

/**
 * Check if KPI value breaches budget thresholds (≥90% per §6.6)
 * Emits alerts when thresholds are crossed
 */
export function checkBudgetBreach(kpi: KpiDefinition): void {
  // Only check budget-related KPIs
  const budgetKpis = [
    'budget-utilization',
    'variance-cost-impact',
    'district-compliance',
    'store-compliance-rate',
    'area-performance'
  ];
  
  if (!budgetKpis.includes(kpi.metricId)) {
    return;
  }
  
  // Check if value exceeds critical threshold (≥90% budget)
  const criticalThreshold = kpi.threshold.critical;
  const warnThreshold = kpi.threshold.warn;
  
  if (typeof window !== 'undefined') {
    if (kpi.value >= criticalThreshold) {
      // Emit critical alert
      emitBudgetBreachAlert(kpi, criticalThreshold, 'CRITICAL');
    } else if (kpi.value >= warnThreshold) {
      // Emit warning alert
      emitBudgetBreachAlert(kpi, warnThreshold, 'WARN');
    }
  }
}

/**
 * Emit budget breach alert
 */
function emitBudgetBreachAlert(kpi: KpiDefinition, threshold: number, severity: 'WARN' | 'CRITICAL'): void {
  // Dynamic import to avoid circular dependencies
  import('../alerts/bus').then(({ emitAlert, AlertUtils }) => {
    const href = getAlertHref(kpi.metricId);
    emitAlert(
      AlertUtils.createBudgetBreachAlert(
        { metricId: kpi.metricId, label: kpi.label },
        threshold,
        severity,
        href
      )
    );
  }).catch(() => {
    // non-blocking: never crash KPI render if alerts module is unavailable
  });
}

/**
 * Get deep-link href for KPI alerts
 */
function getAlertHref(metricId: string): string {
  const hrefMap: Record<string, string> = {
    'budget-utilization': '/orders?filter=budget&status=pending',
    'variance-cost-impact': '/orders?filter=variance&severity=high',
    'district-compliance': '/compliance/events?type=district&status=breach',
    'store-compliance-rate': '/compliance/events?type=store&status=breach',
    'area-performance': '/orders?filter=area&status=pending'
  };
  
  return hrefMap[metricId] || '/dashboard';
}

/**
 * Get KPIs for a specific role
 * Returns 3 KPIs per role as specified in §11 examples
 * Merges development-only threshold overrides
 */
export function getKpisForRole(role: Role): KpiDefinition[] {
  const kpiRegistry: Record<Role, KpiDefinition[]> = {
    SM: [
      {
        metricId: 'store-sales-percentage',
        label: 'Store Sales %',
        value: 87.3,
        unit: '%',
        roleVisibility: ['SM', 'ADMIN'],
        threshold: {
          target: 90,
          warn: 85,
          critical: 80
        },
        trend: 'up',
        sparkline: [82, 84, 85, 87, 86, 87, 87.3]
      },
      {
        metricId: 'variance-rate',
        label: 'Variance Rate',
        value: 12.5,
        unit: '%',
        roleVisibility: ['SM', 'ADMIN'],
        threshold: {
          target: 10,
          warn: 15,
          critical: 20
        },
        trend: 'down',
        sparkline: [15, 14, 13, 12.8, 12.6, 12.4, 12.5]
      },
      {
        metricId: 'fill-rate',
        label: 'Fill Rate',
        value: 94.2,
        unit: '%',
        roleVisibility: ['SM', 'ADMIN'],
        threshold: {
          target: 95,
          warn: 90,
          critical: 85
        },
        trend: 'stable',
        sparkline: [93, 94, 94.5, 94.2, 94.3, 94.1, 94.2]
      }
    ],
    DM: [
      {
        metricId: 'district-compliance',
        label: 'District Compliance %',
        value: 92.8,
        unit: '%',
        roleVisibility: ['DM', 'ADMIN'],
        threshold: {
          target: 95,
          warn: 90,
          critical: 85
        },
        trend: 'up',
        sparkline: [88, 90, 91, 92, 92.5, 92.7, 92.8]
      },
      {
        metricId: 'budget-utilization',
        label: 'Budget Utilization',
        value: 78.5,
        unit: '%',
        roleVisibility: ['DM', 'ADMIN'],
        threshold: {
          target: 85,
          warn: 90,
          critical: 95
        },
        trend: 'stable',
        sparkline: [76, 77, 78, 78.2, 78.4, 78.3, 78.5]
      },
      {
        metricId: 'district-variance-rate',
        label: 'Variance Rate',
        value: 8.3,
        unit: '%',
        roleVisibility: ['DM', 'ADMIN'],
        threshold: {
          target: 8,
          warn: 12,
          critical: 15
        },
        trend: 'down',
        sparkline: [10, 9.5, 9, 8.8, 8.5, 8.4, 8.3]
      }
    ],
    FM: [
      {
        metricId: 'variance-cost-impact',
        label: 'Variance Cost Impact',
        value: 125000,
        unit: '$',
        roleVisibility: ['FM', 'ADMIN'],
        threshold: {
          target: 100000,
          warn: 150000,
          critical: 200000
        },
        trend: 'up',
        sparkline: [110000, 115000, 120000, 122000, 124000, 123000, 125000]
      },
      {
        metricId: 'sla-breaches',
        label: 'SLA Breaches',
        value: 3,
        unit: 'count',
        roleVisibility: ['FM', 'ADMIN'],
        threshold: {
          target: 2,
          warn: 5,
          critical: 10
        },
        trend: 'down',
        sparkline: [5, 4, 4, 3, 3, 3, 3]
      },
      {
        metricId: 'vendor-scorecards',
        label: 'Vendor Scorecards',
        value: 4.2,
        unit: '/5',
        roleVisibility: ['FM', 'ADMIN'],
        threshold: {
          target: 4.5,
          warn: 4.0,
          critical: 3.5
        },
        trend: 'stable',
        sparkline: [4.0, 4.1, 4.2, 4.2, 4.1, 4.2, 4.2]
      }
    ],
    ADMIN: [
      {
        metricId: 'global-kpis-rollup',
        label: 'Global KPIs Rollup',
        value: 89.7,
        unit: '%',
        roleVisibility: ['ADMIN'],
        threshold: {
          target: 90,
          warn: 85,
          critical: 80
        },
        trend: 'up',
        sparkline: [85, 86, 87, 88, 89, 89.5, 89.7]
      },
      {
        metricId: 'cross-role-compliance',
        label: 'Cross-Role Compliance',
        value: 94.1,
        unit: '%',
        roleVisibility: ['ADMIN'],
        threshold: {
          target: 95,
          warn: 90,
          critical: 85
        },
        trend: 'stable',
        sparkline: [93, 94, 94.2, 94.0, 94.1, 94.0, 94.1]
      },
      {
        metricId: 'on-time-delivery',
        label: 'On-Time Delivery %',
        value: 96.8,
        unit: '%',
        roleVisibility: ['ADMIN'],
        threshold: {
          target: 95,
          warn: 90,
          critical: 85
        },
        trend: 'up',
        sparkline: [94, 95, 95.5, 96, 96.5, 96.7, 96.8]
      }
    ],
    COST_ANALYST: [
      {
        metricId: 'dso',
        label: 'DSO',
        value: 28.5,
        unit: 'days',
        roleVisibility: ['COST_ANALYST', 'ADMIN'],
        threshold: {
          target: 30,
          warn: 35,
          critical: 40
        },
        trend: 'down',
        sparkline: [32, 31, 30, 29.5, 29, 28.8, 28.5]
      },
      {
        metricId: 'reconciliation-time',
        label: 'Reconciliation Time',
        value: 2.3,
        unit: 'days',
        roleVisibility: ['COST_ANALYST', 'ADMIN'],
        threshold: {
          target: 2,
          warn: 3,
          critical: 5
        },
        trend: 'up',
        sparkline: [2.0, 2.1, 2.2, 2.2, 2.3, 2.3, 2.3]
      },
      {
        metricId: 'disputed-variance-percentage',
        label: 'Disputed Variance %',
        value: 5.7,
        unit: '%',
        roleVisibility: ['COST_ANALYST', 'ADMIN'],
        threshold: {
          target: 5,
          warn: 8,
          critical: 12
        },
        trend: 'up',
        sparkline: [4.5, 5.0, 5.2, 5.4, 5.6, 5.7, 5.7]
      }
    ],
    WHS: [
      {
        metricId: 'warehouse-efficiency',
        label: 'Warehouse Efficiency',
        value: 91.2,
        unit: '%',
        roleVisibility: ['WHS', 'ADMIN'],
        threshold: {
          target: 90,
          warn: 85,
          critical: 80
        },
        trend: 'up',
        sparkline: [88, 89, 90, 90.5, 91, 91.1, 91.2]
      },
      {
        metricId: 'inventory-accuracy',
        label: 'Inventory Accuracy',
        value: 97.8,
        unit: '%',
        roleVisibility: ['WHS', 'ADMIN'],
        threshold: {
          target: 98,
          warn: 95,
          critical: 90
        },
        trend: 'stable',
        sparkline: [97, 97.5, 97.8, 97.7, 97.8, 97.8, 97.8]
      },
      {
        metricId: 'order-fulfillment-time',
        label: 'Order Fulfillment Time',
        value: 4.2,
        unit: 'hours',
        roleVisibility: ['WHS', 'ADMIN'],
        threshold: {
          target: 4,
          warn: 6,
          critical: 8
        },
        trend: 'up',
        sparkline: [4.5, 4.4, 4.3, 4.2, 4.2, 4.2, 4.2]
      }
    ],
    AM: [
      {
        metricId: 'area-performance',
        label: 'Area Performance',
        value: 88.5,
        unit: '%',
        roleVisibility: ['AM', 'ADMIN'],
        threshold: {
          target: 90,
          warn: 85,
          critical: 80
        },
        trend: 'up',
        sparkline: [85, 86, 87, 87.5, 88, 88.3, 88.5]
      },
      {
        metricId: 'store-compliance-rate',
        label: 'Store Compliance Rate',
        value: 93.2,
        unit: '%',
        roleVisibility: ['AM', 'ADMIN'],
        threshold: {
          target: 95,
          warn: 90,
          critical: 85
        },
        trend: 'stable',
        sparkline: [92, 92.5, 93, 93.1, 93.2, 93.1, 93.2]
      },
      {
        metricId: 'area-variance',
        label: 'Area Variance',
        value: 6.8,
        unit: '%',
        roleVisibility: ['AM', 'ADMIN'],
        threshold: {
          target: 6,
          warn: 10,
          critical: 15
        },
        trend: 'down',
        sparkline: [8, 7.5, 7, 6.9, 6.8, 6.8, 6.8]
      }
    ]
  };

  const baseKpis = kpiRegistry[role] || [];
  const overrides = loadKpiOverrides();
  
  // Merge overrides into base KPIs and check for budget breaches
  return baseKpis.map(kpi => {
    const updatedKpi = {
      ...kpi,
      threshold: overrides[kpi.metricId] || kpi.threshold
    };
    
    // Check for budget breaches and emit alerts
    checkBudgetBreach(updatedKpi);
    
    return updatedKpi;
  });
}

/**
 * Get threshold color class based on value and thresholds
 */
export function getThresholdColor(value: number, threshold: KpiThreshold): 'neutral' | 'warn' | 'critical' {
  if (value <= threshold.critical) {
    return 'critical';
  } else if (value <= threshold.warn) {
    return 'warn';
  }
  return 'neutral';
}

/**
 * Format KPI value with appropriate formatting
 */
export function formatKpiValue(value: number, unit: string): string {
  if (unit === '$') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }
  
  if (unit === 'days' || unit === 'hours') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  if (unit === '/5') {
    return `${value.toFixed(1)}${unit}`;
  }
  
  if (unit === 'count') {
    return value.toString();
  }
  
  // Default percentage formatting
  return `${value.toFixed(1)}${unit}`;
}
