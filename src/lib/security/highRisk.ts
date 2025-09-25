/**
 * High-Risk Actions Security Library
 * Defines actions that require MFA and provides security utilities
 * Aligned to security best practices and audit requirements
 */

export enum HighRiskAction {
  APPROVE_ORDER = 'APPROVE_ORDER',
  RETURN_ORDER = 'RETURN_ORDER',
  APPROVE_VARIANCE = 'APPROVE_VARIANCE',
  RETURN_VARIANCE = 'RETURN_VARIANCE',
  VENDOR_OVERRIDE = 'VENDOR_OVERRIDE'
}

export interface MfaHeaders {
  'X-MFA-Token': string;
  'X-MFA-OTP': string;
}

export interface MfaContext {
  token: string;
  otp: string;
  reasonCode?: string;
  correlationId?: string;
}

/**
 * Check if an action requires MFA
 * All high-risk actions currently require MFA
 */
export function requiresMfa(action: HighRiskAction): boolean {
  // All high-risk actions require MFA
  return Object.values(HighRiskAction).includes(action);
}

/**
 * Get human-readable description for high-risk action
 */
export function getActionDescription(action: HighRiskAction): string {
  switch (action) {
    case HighRiskAction.APPROVE_ORDER:
      return 'Approve Order';
    case HighRiskAction.RETURN_ORDER:
      return 'Return Order';
    case HighRiskAction.APPROVE_VARIANCE:
      return 'Approve Variance';
    case HighRiskAction.RETURN_VARIANCE:
      return 'Return Variance';
    case HighRiskAction.VENDOR_OVERRIDE:
      return 'Vendor Override';
    default:
      return 'High-Risk Action';
  }
}

/**
 * Get risk level description for action
 */
export function getRiskLevel(action: HighRiskAction): 'HIGH' | 'CRITICAL' {
  switch (action) {
    case HighRiskAction.VENDOR_OVERRIDE:
      return 'CRITICAL';
    default:
      return 'HIGH';
  }
}

/**
 * Get required reason codes for action
 */
export function getRequiredReasonCodes(action: HighRiskAction): string[] {
  switch (action) {
    case HighRiskAction.APPROVE_ORDER:
      return ['BUSINESS_JUSTIFICATION', 'CUSTOMER_SATISFACTION', 'OPERATIONAL_NEED'];
    case HighRiskAction.RETURN_ORDER:
      return ['QUALITY_ISSUE', 'CUSTOMER_REQUEST', 'SUPPLIER_ERROR'];
    case HighRiskAction.APPROVE_VARIANCE:
      return ['MARKET_CONDITIONS', 'SUPPLIER_CONSTRAINTS', 'OPERATIONAL_EFFICIENCY'];
    case HighRiskAction.RETURN_VARIANCE:
      return ['DATA_ERROR', 'PROCESS_IMPROVEMENT', 'COMPLIANCE_REQUIREMENT'];
    case HighRiskAction.VENDOR_OVERRIDE:
      return ['EMERGENCY_SITUATION', 'BUSINESS_CRITICAL', 'REGULATORY_COMPLIANCE'];
    default:
      return ['BUSINESS_JUSTIFICATION'];
  }
}

/**
 * Validate reason code for action
 */
export function validateReasonCode(action: HighRiskAction, reasonCode: string): boolean {
  const requiredCodes = getRequiredReasonCodes(action);
  return requiredCodes.includes(reasonCode);
}

/**
 * Annotate MFA headers for HTTP requests
 */
export function annotateMfaHeaders(token: string, otp: string): MfaHeaders {
  return {
    'X-MFA-Token': token,
    'X-MFA-OTP': otp
  };
}

/**
 * Create MFA context for requests
 */
export function createMfaContext(token: string, otp: string, reasonCode?: string): MfaContext {
  return {
    token,
    otp,
    reasonCode,
    correlationId: generateCorrelationId()
  };
}

/**
 * Generate correlation ID for audit trail
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `mfa-${timestamp}-${random}`;
}

/**
 * Get audit message for high-risk action
 */
export function getAuditMessage(action: HighRiskAction, reasonCode?: string): string {
  const description = getActionDescription(action);
  const riskLevel = getRiskLevel(action);
  const baseMessage = `${description} (${riskLevel} RISK)`;
  
  if (reasonCode) {
    return `${baseMessage} - Reason: ${reasonCode}`;
  }
  
  return baseMessage;
}

/**
 * Check if action is vendor-related (requires additional approval)
 */
export function isVendorAction(action: HighRiskAction): boolean {
  return action === HighRiskAction.VENDOR_OVERRIDE;
}

/**
 * Get approval workflow for action
 */
export function getApprovalWorkflow(action: HighRiskAction): string[] {
  switch (action) {
    case HighRiskAction.VENDOR_OVERRIDE:
      return ['MFA_REQUIRED', 'MANAGER_APPROVAL', 'AUDIT_LOG'];
    default:
      return ['MFA_REQUIRED', 'AUDIT_LOG'];
  }
}

/**
 * Get timeout duration for MFA session (in minutes)
 */
export function getMfaTimeout(action: HighRiskAction): number {
  switch (action) {
    case HighRiskAction.VENDOR_OVERRIDE:
      return 5; // 5 minutes for critical actions
    default:
      return 10; // 10 minutes for high-risk actions
  }
}

/**
 * Validate OTP format (6 digits)
 */
export function validateOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Get security requirements for action
 */
export function getSecurityRequirements(action: HighRiskAction): {
  mfaRequired: boolean;
  reasonCodeRequired: boolean;
  auditRequired: boolean;
  timeoutMinutes: number;
} {
  return {
    mfaRequired: requiresMfa(action),
    reasonCodeRequired: true,
    auditRequired: true,
    timeoutMinutes: getMfaTimeout(action)
  };
}

/**
 * Check if current user can perform high-risk action
 * This would integrate with RBAC in a real implementation
 */
export function canPerformHighRiskAction(action: HighRiskAction, userRole: string): boolean {
  // Basic role-based checks
  const allowedRoles = {
    [HighRiskAction.APPROVE_ORDER]: ['ADMIN', 'FM', 'SM'],
    [HighRiskAction.RETURN_ORDER]: ['ADMIN', 'FM', 'SM'],
    [HighRiskAction.APPROVE_VARIANCE]: ['ADMIN', 'FM'],
    [HighRiskAction.RETURN_VARIANCE]: ['ADMIN', 'FM'],
    [HighRiskAction.VENDOR_OVERRIDE]: ['ADMIN']
  };

  return allowedRoles[action]?.includes(userRole) || false;
}

/**
 * Get risk assessment for action
 */
export function getRiskAssessment(action: HighRiskAction): {
  financialImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  operationalImpact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  complianceRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
} {
  switch (action) {
    case HighRiskAction.APPROVE_ORDER:
      return {
        financialImpact: 'MEDIUM',
        operationalImpact: 'MEDIUM',
        complianceRisk: 'LOW'
      };
    case HighRiskAction.RETURN_ORDER:
      return {
        financialImpact: 'HIGH',
        operationalImpact: 'HIGH',
        complianceRisk: 'MEDIUM'
      };
    case HighRiskAction.APPROVE_VARIANCE:
      return {
        financialImpact: 'HIGH',
        operationalImpact: 'MEDIUM',
        complianceRisk: 'MEDIUM'
      };
    case HighRiskAction.RETURN_VARIANCE:
      return {
        financialImpact: 'MEDIUM',
        operationalImpact: 'MEDIUM',
        complianceRisk: 'HIGH'
      };
    case HighRiskAction.VENDOR_OVERRIDE:
      return {
        financialImpact: 'CRITICAL',
        operationalImpact: 'CRITICAL',
        complianceRisk: 'CRITICAL'
      };
    default:
      return {
        financialImpact: 'MEDIUM',
        operationalImpact: 'MEDIUM',
        complianceRisk: 'MEDIUM'
      };
  }
}
