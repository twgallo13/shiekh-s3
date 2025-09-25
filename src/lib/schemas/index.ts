/**
 * JSON Schemas for Section 7 API Contracts
 * Client-only schemas that are tree-shaken in production builds
 * Mirrors §7 examples for request/response shapes and required fields
 */

// Re-export all schema modules
export * from './orders';
export * from './variances';
export * from './approvals';

// Common schema types and utilities
export interface SchemaValidationResult {
  ok: boolean;
  errors: SchemaValidationError[];
}

export interface SchemaValidationError {
  code: string;
  message: string;
  path: string;
  value: any;
  expected?: any;
}

export interface SchemaDefinition {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, SchemaDefinition>;
  required?: string[];
  items?: SchemaDefinition;
  enum?: any[];
  format?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

// Schema validation error codes mapped to §7.9
export const VALIDATION_CODES = {
  VAL_001: 'Invalid type',
  VAL_002: 'Missing required field',
  VAL_003: 'Invalid format',
  VAL_004: 'Value out of range',
  VAL_005: 'Invalid enum value',
  VAL_006: 'Pattern mismatch',
  BIZ_001: 'Business rule violation',
  BIZ_002: 'Invalid state transition',
  BIZ_003: 'Insufficient permissions',
  BIZ_004: 'Resource not found',
  BIZ_005: 'Duplicate resource',
  BIZ_006: 'Invalid correlation ID'
} as const;

export type ValidationCode = keyof typeof VALIDATION_CODES;

// Common field definitions
export const COMMON_FIELDS = {
  id: {
    type: 'string' as const,
    pattern: '^[a-zA-Z0-9_-]+$',
    minLength: 1,
    maxLength: 50
  },
  timestamp: {
    type: 'string' as const,
    format: 'date-time'
  },
  correlationId: {
    type: 'string' as const,
    pattern: '^[a-zA-Z0-9_-]+$',
    minLength: 1,
    maxLength: 100
  },
  actorUserId: {
    type: 'string' as const,
    pattern: '^user-[a-zA-Z0-9_-]+$',
    minLength: 5,
    maxLength: 50
  },
  actorRole: {
    type: 'string' as const,
    enum: ['SM', 'DM', 'FM', 'ADMIN', 'COST_ANALYST', 'WHS', 'AM']
  },
  reasonCode: {
    type: 'string' as const,
    pattern: '^[A-Z_]+$',
    minLength: 3,
    maxLength: 50
  },
  amount: {
    type: 'number' as const,
    minimum: 0,
    maximum: 999999999.99
  },
  currency: {
    type: 'string' as const,
    enum: ['USD', 'EUR', 'GBP', 'CAD']
  },
  status: {
    type: 'string' as const,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']
  },
  urgency: {
    type: 'string' as const,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  }
} as const;

// Common response wrapper
export const COMMON_RESPONSE_WRAPPER = {
  type: 'object' as const,
  properties: {
    success: { type: 'boolean' as const },
    data: { type: 'object' as const },
    error: {
      type: 'object' as const,
      properties: {
        code: { type: 'string' as const },
        message: { type: 'string' as const },
        details: { type: 'object' as const }
      }
    },
    meta: {
      type: 'object' as const,
      properties: {
        timestamp: COMMON_FIELDS.timestamp,
        correlationId: COMMON_FIELDS.correlationId,
        version: { type: 'string' as const }
      }
    }
  },
  required: ['success']
} as const;

// Pagination schema
export const PAGINATION_SCHEMA = {
  type: 'object' as const,
  properties: {
    page: { type: 'number' as const, minimum: 1 },
    limit: { type: 'number' as const, minimum: 1, maximum: 100 },
    total: { type: 'number' as const, minimum: 0 },
    totalPages: { type: 'number' as const, minimum: 0 },
    hasNext: { type: 'boolean' as const },
    hasPrev: { type: 'boolean' as const }
  },
  required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
} as const;

// Error response schema
export const ERROR_RESPONSE_SCHEMA = {
  type: 'object' as const,
  properties: {
    success: { type: 'boolean' as const, enum: [false] },
    error: {
      type: 'object' as const,
      properties: {
        code: { type: 'string' as const },
        message: { type: 'string' as const },
        details: { type: 'object' as const },
        timestamp: COMMON_FIELDS.timestamp,
        correlationId: COMMON_FIELDS.correlationId
      },
      required: ['code', 'message', 'timestamp']
    }
  },
  required: ['success', 'error']
} as const;
