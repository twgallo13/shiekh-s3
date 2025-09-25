/**
 * Schema Validation Checker - Development Only
 * Minimal JSON Schema validator for Section 7 API contracts
 * Maps validation failures to §7.9 error codes
 */

import { 
  SchemaDefinition, 
  SchemaValidationResult, 
  SchemaValidationError, 
  ValidationCode,
  VALIDATION_CODES,
  ORDERS_SCHEMAS,
  VARIANCES_SCHEMAS,
  APPROVALS_SCHEMAS
} from '../schemas';

// Endpoint to schema mapping
const ENDPOINT_SCHEMAS: Record<string, SchemaDefinition> = {
  // Orders endpoints
  'GET /orders': ORDERS_SCHEMAS.GET_ORDERS_RESPONSE,
  'GET /orders/{id}': ORDERS_SCHEMAS.GET_ORDER_RESPONSE,
  'POST /orders': ORDERS_SCHEMAS.CREATE_ORDER_RESPONSE,
  'POST /orders/{id}/approve': ORDERS_SCHEMAS.APPROVE_ORDER_RESPONSE,
  
  // Variances endpoints
  'GET /variances': VARIANCES_SCHEMAS.GET_VARIANCES_RESPONSE,
  'GET /variances/{id}': VARIANCES_SCHEMAS.GET_VARIANCE_RESPONSE,
  'POST /variances': VARIANCES_SCHEMAS.CREATE_VARIANCE_RESPONSE,
  'POST /variances/{id}/approve': VARIANCES_SCHEMAS.APPROVE_VARIANCE_RESPONSE,
  
  // Approvals endpoints
  'GET /approvals': APPROVALS_SCHEMAS.GET_APPROVALS_RESPONSE,
  'GET /approvals/{id}': APPROVALS_SCHEMAS.GET_APPROVAL_RESPONSE,
  'POST /approvals': APPROVALS_SCHEMAS.CREATE_APPROVAL_RESPONSE,
  'POST /approvals/{id}/approve': APPROVALS_SCHEMAS.APPROVE_REQUEST_RESPONSE,
  
  // Audit endpoints
  'GET /audit': APPROVALS_SCHEMAS.GET_AUDIT_RESPONSE,
};

// Request schemas for validation
const REQUEST_SCHEMAS: Record<string, SchemaDefinition> = {
  'POST /orders': ORDERS_SCHEMAS.CREATE_ORDER_REQUEST,
  'POST /orders/{id}/approve': ORDERS_SCHEMAS.APPROVE_ORDER_REQUEST,
  'POST /variances': VARIANCES_SCHEMAS.CREATE_VARIANCE_REQUEST,
  'POST /variances/{id}/approve': VARIANCES_SCHEMAS.APPROVE_VARIANCE_REQUEST,
  'POST /approvals': APPROVALS_SCHEMAS.CREATE_APPROVAL_REQUEST,
  'POST /approvals/{id}/approve': APPROVALS_SCHEMAS.APPROVE_REQUEST,
};

/**
 * Main validation function
 * @param endpointId - The endpoint identifier (e.g., "GET /orders")
 * @param data - The data to validate (request body or response)
 * @param isRequest - Whether this is validating a request (true) or response (false)
 * @returns Validation result with errors mapped to §7.9 codes
 */
export function validate(
  endpointId: string, 
  data: any, 
  isRequest: boolean = false
): SchemaValidationResult {
  if (process.env.NODE_ENV !== 'development') {
    return { ok: true, errors: [] };
  }

  const schema = isRequest 
    ? REQUEST_SCHEMAS[endpointId] 
    : ENDPOINT_SCHEMAS[endpointId];

  if (!schema) {
    return {
      ok: false,
      errors: [{
        code: 'BIZ_004',
        message: `No schema found for endpoint: ${endpointId}`,
        path: '',
        value: data
      }]
    };
  }

  return validateAgainstSchema(data, schema, '');
}

/**
 * Validate data against a JSON schema
 */
function validateAgainstSchema(
  data: any, 
  schema: SchemaDefinition, 
  path: string
): SchemaValidationResult {
  const errors: SchemaValidationError[] = [];

  // Type validation
  if (schema.type && !validateType(data, schema.type)) {
    errors.push({
      code: 'VAL_001',
      message: `Expected ${schema.type}, got ${typeof data}`,
      path: path || 'root',
      value: data,
      expected: schema.type
    });
  }

  // Object validation
  if (schema.type === 'object' && typeof data === 'object' && data !== null) {
    // Required fields validation
    if (schema.required) {
      for (const field of schema.required) {
        if (!(field in data)) {
          errors.push({
            code: 'VAL_002',
            message: `Missing required field: ${field}`,
            path: path ? `${path}.${field}` : field,
            value: undefined,
            expected: 'required field'
          });
        }
      }
    }

    // Properties validation
    if (schema.properties) {
      for (const [key, value] of Object.entries(data)) {
        const fieldSchema = schema.properties[key];
        if (fieldSchema) {
          const fieldPath = path ? `${path}.${key}` : key;
          const fieldResult = validateAgainstSchema(value, fieldSchema, fieldPath);
          errors.push(...fieldResult.errors);
        }
      }
    }
  }

  // Array validation
  if (schema.type === 'array' && Array.isArray(data)) {
    if (schema.items) {
      data.forEach((item, index) => {
        const itemPath = path ? `${path}[${index}]` : `[${index}]`;
        const itemResult = validateAgainstSchema(item, schema.items!, itemPath);
        errors.push(...itemResult.errors);
      });
    }

    // Array length validation
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({
        code: 'VAL_004',
        message: `Array length ${data.length} is less than minimum ${schema.minLength}`,
        path: path || 'root',
        value: data.length,
        expected: `>= ${schema.minLength}`
      });
    }

    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({
        code: 'VAL_004',
        message: `Array length ${data.length} exceeds maximum ${schema.maxLength}`,
        path: path || 'root',
        value: data.length,
        expected: `<= ${schema.maxLength}`
      });
    }
  }

  // String validation
  if (schema.type === 'string' && typeof data === 'string') {
    // Length validation
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({
        code: 'VAL_004',
        message: `String length ${data.length} is less than minimum ${schema.minLength}`,
        path: path || 'root',
        value: data.length,
        expected: `>= ${schema.minLength}`
      });
    }

    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({
        code: 'VAL_004',
        message: `String length ${data.length} exceeds maximum ${schema.maxLength}`,
        path: path || 'root',
        value: data.length,
        expected: `<= ${schema.maxLength}`
      });
    }

    // Pattern validation
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(data)) {
        errors.push({
          code: 'VAL_006',
          message: `String does not match pattern: ${schema.pattern}`,
          path: path || 'root',
          value: data,
          expected: schema.pattern
        });
      }
    }

    // Enum validation
    if (schema.enum && !schema.enum.includes(data)) {
      errors.push({
        code: 'VAL_005',
        message: `Value "${data}" is not in allowed values: ${schema.enum.join(', ')}`,
        path: path || 'root',
        value: data,
        expected: schema.enum
      });
    }

    // Format validation
    if (schema.format) {
      if (!validateFormat(data, schema.format)) {
        errors.push({
          code: 'VAL_003',
          message: `Invalid format: ${schema.format}`,
          path: path || 'root',
          value: data,
          expected: schema.format
        });
      }
    }
  }

  // Number validation
  if (schema.type === 'number' && typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({
        code: 'VAL_004',
        message: `Value ${data} is less than minimum ${schema.minimum}`,
        path: path || 'root',
        value: data,
        expected: `>= ${schema.minimum}`
      });
    }

    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({
        code: 'VAL_004',
        message: `Value ${data} exceeds maximum ${schema.maximum}`,
        path: path || 'root',
        value: data,
        expected: `<= ${schema.maximum}`
      });
    }
  }

  // Boolean validation
  if (schema.type === 'boolean' && typeof data !== 'boolean') {
    errors.push({
      code: 'VAL_001',
      message: `Expected boolean, got ${typeof data}`,
      path: path || 'root',
      value: data,
      expected: 'boolean'
    });
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

/**
 * Validate data type
 */
function validateType(data: any, expectedType: string): boolean {
  switch (expectedType) {
    case 'string':
      return typeof data === 'string';
    case 'number':
      return typeof data === 'number' && !isNaN(data);
    case 'boolean':
      return typeof data === 'boolean';
    case 'object':
      return typeof data === 'object' && data !== null && !Array.isArray(data);
    case 'array':
      return Array.isArray(data);
    default:
      return false;
  }
}

/**
 * Validate string format
 */
function validateFormat(value: string, format: string): boolean {
  switch (format) {
    case 'date-time':
      return !isNaN(Date.parse(value));
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'uri':
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    default:
      return true; // Unknown format, assume valid
  }
}

/**
 * Get validation code description
 */
export function getValidationCodeDescription(code: ValidationCode): string {
  return VALIDATION_CODES[code] || 'Unknown validation error';
}

/**
 * Check if endpoint has schema defined
 */
export function hasSchema(endpointId: string, isRequest: boolean = false): boolean {
  if (isRequest) {
    return endpointId in REQUEST_SCHEMAS;
  }
  return endpointId in ENDPOINT_SCHEMAS;
}

/**
 * Get all available endpoints
 */
export function getAvailableEndpoints(): string[] {
  return Object.keys(ENDPOINT_SCHEMAS);
}

/**
 * Get all available request endpoints
 */
export function getAvailableRequestEndpoints(): string[] {
  return Object.keys(REQUEST_SCHEMAS);
}

/**
 * Create a sample payload for an endpoint
 */
export function createSamplePayload(endpointId: string, isRequest: boolean = false): any {
  const schema = isRequest 
    ? REQUEST_SCHEMAS[endpointId] 
    : ENDPOINT_SCHEMAS[endpointId];

  if (!schema) {
    return null;
  }

  return createSampleFromSchema(schema);
}

/**
 * Create sample data from schema
 */
function createSampleFromSchema(schema: SchemaDefinition): any {
  switch (schema.type) {
    case 'string':
      if (schema.enum) {
        return schema.enum[0];
      }
      if (schema.pattern?.includes('ORD-')) {
        return 'ORD-123456';
      }
      if (schema.pattern?.includes('VAR-')) {
        return 'VAR-123456';
      }
      if (schema.pattern?.includes('REQ-')) {
        return 'REQ-123456';
      }
      if (schema.pattern?.includes('user-')) {
        return 'user-123';
      }
      if (schema.pattern?.includes('CUST-')) {
        return 'CUST-123';
      }
      if (schema.pattern?.includes('WH-')) {
        return 'WH-001';
      }
      return 'sample-string';
    
    case 'number':
      return schema.minimum || 0;
    
    case 'boolean':
      return true;
    
    case 'array':
      if (schema.items) {
        return [createSampleFromSchema(schema.items)];
      }
      return [];
    
    case 'object':
      const obj: any = {};
      if (schema.properties) {
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          obj[key] = createSampleFromSchema(propSchema);
        }
      }
      return obj;
    
    default:
      return null;
  }
}
