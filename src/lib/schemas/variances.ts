/**
 * Variances API Schemas - Section 7.2
 * JSON Schemas for variances endpoints following §7 API contracts
 */

import { SchemaDefinition, COMMON_FIELDS, COMMON_RESPONSE_WRAPPER, PAGINATION_SCHEMA } from './index';

// Variance item schema
export const VARIANCE_ITEM_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    sku: {
      type: 'string',
      pattern: '^SKU-[A-Z0-9-]+$',
      minLength: 4,
      maxLength: 20
    },
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 200
    },
    expectedQuantity: {
      type: 'number',
      minimum: 0,
      maximum: 9999
    },
    actualQuantity: {
      type: 'number',
      minimum: 0,
      maximum: 9999
    },
    varianceQuantity: {
      type: 'number'
    },
    unitCost: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    varianceCost: {
      type: 'number'
    },
    category: {
      type: 'string',
      enum: ['ELECTRONICS', 'CLOTHING', 'HOME', 'AUTOMOTIVE', 'OFFICE', 'OTHER']
    }
  },
  required: ['sku', 'description', 'expectedQuantity', 'actualQuantity', 'varianceQuantity', 'unitCost', 'varianceCost']
};

// Variance schema
export const VARIANCE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    id: COMMON_FIELDS.id,
    varianceNumber: {
      type: 'string',
      pattern: '^VAR-[0-9]{6}$',
      minLength: 10,
      maxLength: 10
    },
    warehouseId: {
      type: 'string',
      pattern: '^WH-[A-Z0-9-]+$',
      minLength: 4,
      maxLength: 20
    },
    warehouseName: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    items: {
      type: 'array',
      items: VARIANCE_ITEM_SCHEMA,
      minLength: 1,
      maxLength: 100
    },
    totalExpectedValue: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    totalActualValue: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    totalVarianceValue: {
      type: 'number'
    },
    variancePercentage: {
      type: 'number',
      minimum: -100,
      maximum: 100
    },
    currency: COMMON_FIELDS.currency,
    status: COMMON_FIELDS.status,
    urgency: COMMON_FIELDS.urgency,
    varianceType: {
      type: 'string',
      enum: ['INVENTORY', 'SHIPPING', 'RECEIVING', 'DAMAGE', 'THEFT', 'ADMINISTRATIVE']
    },
    reasonCode: COMMON_FIELDS.reasonCode,
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    investigationNotes: {
      type: 'string',
      maxLength: 1000
    },
    correctiveActions: {
      type: 'string',
      maxLength: 1000
    },
    reportedBy: COMMON_FIELDS.actorUserId,
    reportedByRole: COMMON_FIELDS.actorRole,
    investigatedBy: {
      type: 'string',
      pattern: '^user-[a-zA-Z0-9_-]+$'
    },
    investigatedByRole: COMMON_FIELDS.actorRole,
    createdAt: COMMON_FIELDS.timestamp,
    updatedAt: COMMON_FIELDS.timestamp,
    investigatedAt: COMMON_FIELDS.timestamp,
    correlationId: COMMON_FIELDS.correlationId
  },
  required: [
    'id', 'varianceNumber', 'warehouseId', 'warehouseName', 'items',
    'totalExpectedValue', 'totalActualValue', 'totalVarianceValue', 'variancePercentage',
    'currency', 'status', 'urgency', 'varianceType', 'reasonCode', 'description',
    'reportedBy', 'reportedByRole', 'createdAt', 'updatedAt'
  ]
};

// Create variance request schema
export const CREATE_VARIANCE_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    warehouseId: {
      type: 'string',
      pattern: '^WH-[A-Z0-9-]+$',
      minLength: 4,
      maxLength: 20
    },
    warehouseName: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    items: {
      type: 'array',
      items: VARIANCE_ITEM_SCHEMA,
      minLength: 1,
      maxLength: 100
    },
    urgency: COMMON_FIELDS.urgency,
    varianceType: {
      type: 'string',
      enum: ['INVENTORY', 'SHIPPING', 'RECEIVING', 'DAMAGE', 'THEFT', 'ADMINISTRATIVE']
    },
    reasonCode: COMMON_FIELDS.reasonCode,
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    investigationNotes: {
      type: 'string',
      maxLength: 1000
    },
    correlationId: COMMON_FIELDS.correlationId
  },
  required: [
    'warehouseId', 'warehouseName', 'items', 'urgency', 
    'varianceType', 'reasonCode', 'description'
  ]
};

// Update variance request schema
export const UPDATE_VARIANCE_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    status: COMMON_FIELDS.status,
    urgency: COMMON_FIELDS.urgency,
    investigationNotes: {
      type: 'string',
      maxLength: 1000
    },
    correctiveActions: {
      type: 'string',
      maxLength: 1000
    },
    investigatedBy: {
      type: 'string',
      pattern: '^user-[a-zA-Z0-9_-]+$'
    },
    investigatedByRole: COMMON_FIELDS.actorRole,
    correlationId: COMMON_FIELDS.correlationId
  }
};

// Approve variance request schema
export const APPROVE_VARIANCE_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    approvedBy: COMMON_FIELDS.actorUserId,
    approvedByRole: COMMON_FIELDS.actorRole,
    reasonCode: COMMON_FIELDS.reasonCode,
    notes: {
      type: 'string',
      maxLength: 500
    },
    correlationId: COMMON_FIELDS.correlationId
  },
  required: ['approvedBy', 'approvedByRole', 'reasonCode']
};

// GET /variances response schema
export const GET_VARIANCES_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        variances: {
          type: 'array',
          items: VARIANCE_SCHEMA
        },
        pagination: PAGINATION_SCHEMA
      },
      required: ['variances', 'pagination']
    },
    meta: {
      type: 'object',
      properties: {
        timestamp: COMMON_FIELDS.timestamp,
        correlationId: COMMON_FIELDS.correlationId,
        version: { type: 'string' }
      },
      required: ['timestamp', 'correlationId', 'version']
    }
  },
  required: ['success', 'data', 'meta']
};

// GET /variances/{id} response schema
export const GET_VARIANCE_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        variance: VARIANCE_SCHEMA
      },
      required: ['variance']
    },
    meta: {
      type: 'object',
      properties: {
        timestamp: COMMON_FIELDS.timestamp,
        correlationId: COMMON_FIELDS.correlationId,
        version: { type: 'string' }
      },
      required: ['timestamp', 'correlationId', 'version']
    }
  },
  required: ['success', 'data', 'meta']
};

// POST /variances response schema
export const CREATE_VARIANCE_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        variance: VARIANCE_SCHEMA,
        varianceNumber: {
          type: 'string',
          pattern: '^VAR-[0-9]{6}$'
        }
      },
      required: ['variance', 'varianceNumber']
    },
    meta: {
      type: 'object',
      properties: {
        timestamp: COMMON_FIELDS.timestamp,
        correlationId: COMMON_FIELDS.correlationId,
        version: { type: 'string' }
      },
      required: ['timestamp', 'correlationId', 'version']
    }
  },
  required: ['success', 'data', 'meta']
};

// POST /variances/{id}/approve response schema
export const APPROVE_VARIANCE_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        variance: VARIANCE_SCHEMA,
        approval: {
          type: 'object',
          properties: {
            id: COMMON_FIELDS.id,
            varianceId: COMMON_FIELDS.id,
            approvedBy: COMMON_FIELDS.actorUserId,
            approvedByRole: COMMON_FIELDS.actorRole,
            reasonCode: COMMON_FIELDS.reasonCode,
            approvedAt: COMMON_FIELDS.timestamp,
            notes: { type: 'string', maxLength: 500 }
          },
          required: ['id', 'varianceId', 'approvedBy', 'approvedByRole', 'reasonCode', 'approvedAt']
        }
      },
      required: ['variance', 'approval']
    },
    meta: {
      type: 'object',
      properties: {
        timestamp: COMMON_FIELDS.timestamp,
        correlationId: COMMON_FIELDS.correlationId,
        version: { type: 'string' }
      },
      required: ['timestamp', 'correlationId', 'version']
    }
  },
  required: ['success', 'data', 'meta']
};

// Export all schemas for easy access
export const VARIANCES_SCHEMAS = {
  VARIANCE_ITEM: VARIANCE_ITEM_SCHEMA,
  VARIANCE: VARIANCE_SCHEMA,
  CREATE_VARIANCE_REQUEST: CREATE_VARIANCE_REQUEST_SCHEMA,
  UPDATE_VARIANCE_REQUEST: UPDATE_VARIANCE_REQUEST_SCHEMA,
  APPROVE_VARIANCE_REQUEST: APPROVE_VARIANCE_REQUEST_SCHEMA,
  GET_VARIANCES_RESPONSE: GET_VARIANCES_RESPONSE_SCHEMA,
  GET_VARIANCE_RESPONSE: GET_VARIANCE_RESPONSE_SCHEMA,
  CREATE_VARIANCE_RESPONSE: CREATE_VARIANCE_RESPONSE_SCHEMA,
  APPROVE_VARIANCE_RESPONSE: APPROVE_VARIANCE_RESPONSE_SCHEMA
} as const;
