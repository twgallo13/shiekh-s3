/**
 * Orders API Schemas - Section 7.1
 * JSON Schemas for orders endpoints following §7 API contracts
 */

import { SchemaDefinition, COMMON_FIELDS, COMMON_RESPONSE_WRAPPER, PAGINATION_SCHEMA } from './index';

// Order item schema
export const ORDER_ITEM_SCHEMA: SchemaDefinition = {
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
    quantity: {
      type: 'number',
      minimum: 1,
      maximum: 9999
    },
    unitPrice: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    totalPrice: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    category: {
      type: 'string',
      enum: ['ELECTRONICS', 'CLOTHING', 'HOME', 'AUTOMOTIVE', 'OFFICE', 'OTHER']
    }
  },
  required: ['sku', 'description', 'quantity', 'unitPrice', 'totalPrice']
};

// Order schema
export const ORDER_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    id: COMMON_FIELDS.id,
    orderNumber: {
      type: 'string',
      pattern: '^ORD-[0-9]{6}$',
      minLength: 10,
      maxLength: 10
    },
    customerId: {
      type: 'string',
      pattern: '^CUST-[A-Z0-9-]+$',
      minLength: 8,
      maxLength: 20
    },
    customerName: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    items: {
      type: 'array',
      items: ORDER_ITEM_SCHEMA,
      minLength: 1,
      maxLength: 50
    },
    subtotal: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    tax: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    shipping: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    total: {
      type: 'number',
      minimum: 0,
      maximum: 999999.99
    },
    currency: COMMON_FIELDS.currency,
    status: COMMON_FIELDS.status,
    urgency: COMMON_FIELDS.urgency,
    shippingAddress: {
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 1, maxLength: 100 },
        city: { type: 'string', minLength: 1, maxLength: 50 },
        state: { type: 'string', minLength: 2, maxLength: 2 },
        zipCode: { type: 'string', pattern: '^[0-9]{5}(-[0-9]{4})?$' },
        country: { type: 'string', enum: ['US', 'CA', 'MX'] }
      },
      required: ['street', 'city', 'state', 'zipCode', 'country']
    },
    billingAddress: {
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 1, maxLength: 100 },
        city: { type: 'string', minLength: 1, maxLength: 50 },
        state: { type: 'string', minLength: 2, maxLength: 2 },
        zipCode: { type: 'string', pattern: '^[0-9]{5}(-[0-9]{4})?$' },
        country: { type: 'string', enum: ['US', 'CA', 'MX'] }
      },
      required: ['street', 'city', 'state', 'zipCode', 'country']
    },
    paymentMethod: {
      type: 'string',
      enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH']
    },
    notes: {
      type: 'string',
      maxLength: 500
    },
    createdAt: COMMON_FIELDS.timestamp,
    updatedAt: COMMON_FIELDS.timestamp,
    correlationId: COMMON_FIELDS.correlationId
  },
  required: [
    'id', 'orderNumber', 'customerId', 'customerName', 'items', 
    'subtotal', 'tax', 'shipping', 'total', 'currency', 'status', 
    'urgency', 'shippingAddress', 'billingAddress', 'paymentMethod',
    'createdAt', 'updatedAt'
  ]
};

// Create order request schema
export const CREATE_ORDER_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    customerId: {
      type: 'string',
      pattern: '^CUST-[A-Z0-9-]+$',
      minLength: 8,
      maxLength: 20
    },
    customerName: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    items: {
      type: 'array',
      items: ORDER_ITEM_SCHEMA,
      minLength: 1,
      maxLength: 50
    },
    urgency: COMMON_FIELDS.urgency,
    shippingAddress: {
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 1, maxLength: 100 },
        city: { type: 'string', minLength: 1, maxLength: 50 },
        state: { type: 'string', minLength: 2, maxLength: 2 },
        zipCode: { type: 'string', pattern: '^[0-9]{5}(-[0-9]{4})?$' },
        country: { type: 'string', enum: ['US', 'CA', 'MX'] }
      },
      required: ['street', 'city', 'state', 'zipCode', 'country']
    },
    billingAddress: {
      type: 'object',
      properties: {
        street: { type: 'string', minLength: 1, maxLength: 100 },
        city: { type: 'string', minLength: 1, maxLength: 50 },
        state: { type: 'string', minLength: 2, maxLength: 2 },
        zipCode: { type: 'string', pattern: '^[0-9]{5}(-[0-9]{4})?$' },
        country: { type: 'string', enum: ['US', 'CA', 'MX'] }
      },
      required: ['street', 'city', 'state', 'zipCode', 'country']
    },
    paymentMethod: {
      type: 'string',
      enum: ['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CASH']
    },
    notes: {
      type: 'string',
      maxLength: 500
    },
    correlationId: COMMON_FIELDS.correlationId
  },
  required: [
    'customerId', 'customerName', 'items', 'urgency', 
    'shippingAddress', 'billingAddress', 'paymentMethod'
  ]
};

// Update order request schema
export const UPDATE_ORDER_REQUEST_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    status: COMMON_FIELDS.status,
    urgency: COMMON_FIELDS.urgency,
    notes: {
      type: 'string',
      maxLength: 500
    },
    correlationId: COMMON_FIELDS.correlationId
  }
};

// Approve order request schema
export const APPROVE_ORDER_REQUEST_SCHEMA: SchemaDefinition = {
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

// GET /orders response schema
export const GET_ORDERS_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        orders: {
          type: 'array',
          items: ORDER_SCHEMA
        },
        pagination: PAGINATION_SCHEMA
      },
      required: ['orders', 'pagination']
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

// GET /orders/{id} response schema
export const GET_ORDER_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        order: ORDER_SCHEMA
      },
      required: ['order']
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

// POST /orders response schema
export const CREATE_ORDER_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        order: ORDER_SCHEMA,
        orderNumber: {
          type: 'string',
          pattern: '^ORD-[0-9]{6}$'
        }
      },
      required: ['order', 'orderNumber']
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

// POST /orders/{id}/approve response schema
export const APPROVE_ORDER_RESPONSE_SCHEMA: SchemaDefinition = {
  type: 'object',
  properties: {
    success: { type: 'boolean', enum: [true] },
    data: {
      type: 'object',
      properties: {
        order: ORDER_SCHEMA,
        approval: {
          type: 'object',
          properties: {
            id: COMMON_FIELDS.id,
            orderId: COMMON_FIELDS.id,
            approvedBy: COMMON_FIELDS.actorUserId,
            approvedByRole: COMMON_FIELDS.actorRole,
            reasonCode: COMMON_FIELDS.reasonCode,
            approvedAt: COMMON_FIELDS.timestamp,
            notes: { type: 'string', maxLength: 500 }
          },
          required: ['id', 'orderId', 'approvedBy', 'approvedByRole', 'reasonCode', 'approvedAt']
        }
      },
      required: ['order', 'approval']
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
export const ORDERS_SCHEMAS = {
  ORDER_ITEM: ORDER_ITEM_SCHEMA,
  ORDER: ORDER_SCHEMA,
  CREATE_ORDER_REQUEST: CREATE_ORDER_REQUEST_SCHEMA,
  UPDATE_ORDER_REQUEST: UPDATE_ORDER_REQUEST_SCHEMA,
  APPROVE_ORDER_REQUEST: APPROVE_ORDER_REQUEST_SCHEMA,
  GET_ORDERS_RESPONSE: GET_ORDERS_RESPONSE_SCHEMA,
  GET_ORDER_RESPONSE: GET_ORDER_RESPONSE_SCHEMA,
  CREATE_ORDER_RESPONSE: CREATE_ORDER_RESPONSE_SCHEMA,
  APPROVE_ORDER_RESPONSE: APPROVE_ORDER_RESPONSE_SCHEMA
} as const;
