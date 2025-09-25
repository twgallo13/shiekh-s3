/**
 * Approvals API Schemas - Section 7.3
 * JSON Schemas for approvals endpoints following §7 API contracts
 */

import { SchemaDefinition, COMMON_FIELDS, COMMON_RESPONSE_WRAPPER, PAGINATION_SCHEMA } from './index';

// Approval request schema
export const APPROVAL_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    id: COMMON_FIELDS.id,
    requestId: {
      type: 'string',
      pattern: '^REQ-[0-9]{6}$',
      minLength: 10,
      maxLength: 10
    },
    type: {
      type: 'string',
      enum: ['BUDGET_APPROVAL', 'VARIANCE_APPROVAL', 'PURCHASE_ORDER', 'EQUIPMENT_REQUEST', 'TRAVEL_REQUEST', 'OTHER']
    },
    urgency: COMMON_FIELDS.urgency,
    status: COMMON_FIELDS.status,
    amount: COMMON_FIELDS.amount,
    currency: COMMON_FIELDS.currency,
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    justification: {
      type: 'string',
      minLength: 1,
      maxLength: 1000
    },
    businessImpact: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    riskLevel: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    submittedBy: COMMON_FIELDS.actorUserId,
    submittedByRole: COMMON_FIELDS.actorRole,
    submittedAt: COMMON_FIELDS.timestamp,
    approvedBy: {
      type: 'string',
      pattern: '^user-[a-zA-Z0-9_-]+$'
    },
    approvedByRole: COMMON_FIELDS.actorRole,
    approvedAt: COMMON_FIELDS.timestamp,
    rejectionReason: {
      type: 'string',
      maxLength: 500
    },
    rejectionCode: {
      type: 'string',
      pattern: '^[A-Z_]+$'
    },
    notes: {
      type: 'string',
      maxLength: 1000
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: COMMON_FIELDS.id,
          filename: {
            type: 'string',
            minLength: 1,
            maxLength: 255
          },
          contentType: {
            type: 'string',
            pattern: '^[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*/[a-zA-Z0-9][a-zA-Z0-9!#$&\-\^_]*$'
          },
          size: {
            type: 'number',
            minimum: 1,
            maximum: 10485760 // 10MB
          },
          uploadedAt: COMMON_FIELDS.timestamp
        },
        required: ['id', 'filename', 'contentType', 'size', 'uploadedAt']
      },
      maxLength: 10
    },
    workflow: {
      type: 'object',
      properties: {
        currentStep: {
          type: 'number',
          minimum: 1,
          maximum: 10
        },
        totalSteps: {
          type: 'number',
          minimum: 1,
          maximum: 10
        },
        steps: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stepNumber: {
                type: 'number',
                minimum: 1,
                maximum: 10
              },
              stepName: {
                type: 'string',
                minLength: 1,
                maxLength: 100
              },
              requiredRole: COMMON_FIELDS.actorRole,
              status: {
                type: 'string',
                enum: ['PENDING', 'APPROVED', 'REJECTED', 'SKIPPED']
              },
              completedBy: {
                type: 'string',
                pattern: '^user-[a-zA-Z0-9_-]+$'
              },
              completedAt: COMMON_FIELDS.timestamp,
              notes: {
                type: 'string',
                maxLength: 500
              }
            },
            required: ['stepNumber', 'stepName', 'requiredRole', 'status']
          }
        }
      },
      required: ['currentStep', 'totalSteps', 'steps']
    },
    createdAt: COMMON_FIELDS.timestamp,
    updatedAt: COMMON_FIELDS.timestamp,
    correlationId: COMMON_FIELDS.correlationId
  },
  required: [
    'id', 'requestId', 'type', 'urgency', 'status', 'description', 'justification',
    'businessImpact', 'riskLevel', 'submittedBy', 'submittedByRole', 'submittedAt',
    'workflow', 'createdAt', 'updatedAt'
  ]
};

// Create approval request schema
export const CREATE_APPROVAL_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['BUDGET_APPROVAL', 'VARIANCE_APPROVAL', 'PURCHASE_ORDER', 'EQUIPMENT_REQUEST', 'TRAVEL_REQUEST', 'OTHER']
    },
    urgency: COMMON_FIELDS.urgency,
    amount: COMMON_FIELDS.amount,
    currency: COMMON_FIELDS.currency,
    description: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    justification: {
      type: 'string',
      minLength: 1,
      maxLength: 1000
    },
    businessImpact: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    riskLevel: {
      type: 'string',
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
    },
    notes: {
      type: 'string',
      maxLength: 1000
    },
    correlationId: COMMON_FIELDS.correlationId
  },
  required: [
    'type', 'urgency', 'description', 'justification', 
    'businessImpact', 'riskLevel'
  ]
};

// Approve request schema
export const APPROVE_REQUEST_SCHEMA: SchemaDefinition = {
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

// Reject request schema
export const REJECT_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    rejectedBy: COMMON_FIELDS.actorUserId,
    rejectedByRole: COMMON_FIELDS.actorRole,
    rejectionReason: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    rejectionCode: {
      type: 'string',
      pattern: '^[A-Z_]+$'
    },
    notes: {
      type: 'string',
      maxLength: 500
    },
    correlationId: COMMON_FIELDS.correlationId
  },
  required: ['rejectedBy', 'rejectedByRole', 'rejectionReason', 'rejectionCode']
};

// GET /approvals response schema
export const GET_APPROVALS_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        approvals: {
          type: 'array',
          items: APPROVAL_REQUEST_SCHEMA
        },
        pagination: PAGINATION_SCHEMA
      },
      required: ['approvals', 'pagination']
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

// GET /approvals/{id} response schema
export const GET_APPROVAL_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        approval: APPROVAL_REQUEST_SCHEMA
      },
      required: ['approval']
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

// POST /approvals response schema
export const CREATE_APPROVAL_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        approval: APPROVAL_REQUEST_SCHEMA,
        requestId: {
          type: 'string',
          pattern: '^REQ-[0-9]{6}$'
        }
      },
      required: ['approval', 'requestId']
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

// POST /approvals/{id}/approve response schema
export const APPROVE_REQUEST_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        approval: APPROVAL_REQUEST_SCHEMA,
        approvalAction: {
          type: 'object',
          properties: {
            id: COMMON_FIELDS.id,
            requestId: COMMON_FIELDS.id,
            action: {
              type: 'string',
              enum: ['APPROVED', 'REJECTED']
            },
            actionBy: COMMON_FIELDS.actorUserId,
            actionByRole: COMMON_FIELDS.actorRole,
            reasonCode: COMMON_FIELDS.reasonCode,
            actionAt: COMMON_FIELDS.timestamp,
            notes: { type: 'string', maxLength: 500 }
          },
          required: ['id', 'requestId', 'action', 'actionBy', 'actionByRole', 'actionAt']
        }
      },
      required: ['approval', 'approvalAction']
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

// Audit schema for GET /audit
export const AUDIT_ENTRY_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    id: COMMON_FIELDS.id,
    timestamp: COMMON_FIELDS.timestamp,
    actorUserId: COMMON_FIELDS.actorUserId,
    actorRole: COMMON_FIELDS.actorRole,
    action: {
      type: 'string',
      pattern: '^[A-Z_]+$',
      minLength: 3,
      maxLength: 50
    },
    resourceType: {
      type: 'string',
      enum: ['ORDER', 'VARIANCE', 'APPROVAL', 'USER', 'SYSTEM']
    },
    resourceId: COMMON_FIELDS.id,
    correlationId: COMMON_FIELDS.correlationId,
    reasonCode: COMMON_FIELDS.reasonCode,
    details: {
      type: 'string',
      minLength: 1,
      maxLength: 1000
    },
    ipAddress: {
      type: 'string',
      pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$'
    },
    userAgent: {
      type: 'string',
      maxLength: 500
    },
    sessionId: {
      type: 'string',
      pattern: '^[a-zA-Z0-9_-]+$'
    }
  },
  required: [
    'id', 'timestamp', 'actorUserId', 'actorRole', 'action', 
    'resourceType', 'resourceId', 'correlationId', 'details'
  ]
};

// GET /audit response schema
export const GET_AUDIT_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        auditEntries: {
          type: 'array',
          items: AUDIT_ENTRY_SCHEMA
        },
        pagination: PAGINATION_SCHEMA
      },
      required: ['auditEntries', 'pagination']
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
export const APPROVALS_SCHEMAS = {
  APPROVAL_REQUEST: APPROVAL_REQUEST_SCHEMA,
  CREATE_APPROVAL_REQUEST: CREATE_APPROVAL_REQUEST_SCHEMA,
  APPROVE_REQUEST: APPROVE_REQUEST_SCHEMA,
  REJECT_REQUEST: REJECT_REQUEST_SCHEMA,
  GET_APPROVALS_RESPONSE: GET_APPROVALS_RESPONSE_SCHEMA,
  GET_APPROVAL_RESPONSE: GET_APPROVAL_RESPONSE_SCHEMA,
  CREATE_APPROVAL_RESPONSE: CREATE_APPROVAL_RESPONSE_SCHEMA,
  APPROVE_REQUEST_RESPONSE: APPROVE_REQUEST_RESPONSE_SCHEMA,
  AUDIT_ENTRY: AUDIT_ENTRY_SCHEMA,
  GET_AUDIT_RESPONSE: GET_AUDIT_RESPONSE_SCHEMA
} as const;
