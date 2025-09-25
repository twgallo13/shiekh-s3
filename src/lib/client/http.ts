/**
 * HTTP Client with MFA Support and Schema Validation
 * Wrapper around fetch with MFA headers, error handling, and dev-only schema validation
 * Aligned to §7.9 Error Codes and §7.1 Common Error Model
 */

// Schema validation imports (dev-only)
let validate: any = null;
let addValidationEntry: any = null;

// Lazy load schema validation in development
if (process.env.NODE_ENV === 'development') {
  import('../dev/schemaCheck').then(module => {
    validate = module.validate;
  });
  
  // We'll set addValidationEntry from the overlay component
}

export interface ErrorLike {
  code: string;
  message: string;
  details?: any;
  correlationId?: string;
}

export interface MfaRequiredError extends ErrorLike {
  code: 'AUTH_002';
  details: {
    mfaRequired: true;
    action?: string;
  };
}

export interface HttpRequestOptions extends RequestInit {
  mfaHeaders?: {
    'X-MFA-Token': string;
    'X-MFA-OTP': string;
  };
  correlationId?: string;
}

export interface HttpResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
  correlationId: string;
}

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make HTTP request with MFA support and schema validation
   */
  async request<T = any>(
    url: string,
    options: HttpRequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const {
      mfaHeaders,
      correlationId = this.generateCorrelationId(),
      ...fetchOptions
    } = options;

    // Build headers
    const headers = new Headers({
      ...this.defaultHeaders,
      ...fetchOptions.headers,
    });

    // Add MFA headers if provided
    if (mfaHeaders) {
      headers.set('X-MFA-Token', mfaHeaders['X-MFA-Token']);
      headers.set('X-MFA-OTP', mfaHeaders['X-MFA-OTP']);
    }

    // Add correlation ID
    headers.set('X-Correlation-ID', correlationId);

    // Build full URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    // Extract endpoint for schema validation
    const endpoint = this.extractEndpoint(fullUrl, fetchOptions.method || 'GET');

    // Validate request body if present (dev-only)
    if (process.env.NODE_ENV === 'development' && validate && fetchOptions.body) {
      try {
        const requestData = typeof fetchOptions.body === 'string' 
          ? JSON.parse(fetchOptions.body) 
          : fetchOptions.body;
        
        const validationResult = validate(endpoint, requestData, true);
        
        // Add validation entry to overlay
        if (addValidationEntry) {
          addValidationEntry(endpoint, requestData, true);
        }

        // Log validation errors
        if (!validationResult.ok) {
          console.warn('Request schema validation failed:', {
            endpoint,
            errors: validationResult.errors
          });
        }
      } catch (error) {
        console.warn('Failed to validate request schema:', error);
      }
    }

    try {
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        headers,
      });

      const responseData = await this.parseResponse(response);

      // Validate response (dev-only)
      if (process.env.NODE_ENV === 'development' && validate) {
        try {
          const validationResult = validate(endpoint, responseData, false);
          
          // Add validation entry to overlay
          if (addValidationEntry) {
            addValidationEntry(endpoint, responseData, false);
          }

          // Log validation errors
          if (!validationResult.ok) {
            console.warn('Response schema validation failed:', {
              endpoint,
              errors: validationResult.errors
            });
          }
        } catch (error) {
          console.warn('Failed to validate response schema:', error);
        }
      }

      // Handle non-2xx responses
      if (!response.ok) {
        const error = await this.parseError(response, responseData, correlationId);
        throw error;
      }

      return {
        data: responseData,
        status: response.status,
        headers: response.headers,
        correlationId,
      };
    } catch (error) {
      // Re-throw MFA errors as-is
      if (this.isMfaRequiredError(error)) {
        throw error;
      }

      // Wrap other errors
      throw this.wrapError(error, correlationId);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    url: string,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(
    url: string,
    data?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    url: string,
    data?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    url: string,
    data?: any,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    url: string,
    options: Omit<HttpRequestOptions, 'method' | 'body'> = {}
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Parse response body
   */
  private async parseResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    }
    
    if (contentType?.includes('text/')) {
      return response.text();
    }
    
    return response.blob();
  }

  /**
   * Parse error response
   */
  private async parseError(
    response: Response,
    responseData: any,
    correlationId: string
  ): Promise<ErrorLike> {
    // Try to parse error from response
    let error: ErrorLike;

    if (responseData && typeof responseData === 'object' && responseData.error) {
      // Server returned structured error
      error = {
        code: responseData.error.code || this.mapHttpStatusToErrorCode(response.status),
        message: responseData.error.message || response.statusText,
        details: responseData.error.details,
        correlationId,
      };
    } else {
      // Fallback to HTTP status
      error = {
        code: this.mapHttpStatusToErrorCode(response.status),
        message: responseData || response.statusText,
        correlationId,
      };
    }

    // Check for MFA required
    if (this.isMfaRequiredResponse(response, error)) {
      return {
        ...error,
        code: 'AUTH_002',
        details: {
          mfaRequired: true,
          action: error.details?.action,
        },
      } as MfaRequiredError;
    }

    return error;
  }

  /**
   * Check if response indicates MFA is required
   */
  private isMfaRequiredResponse(response: Response, error: ErrorLike): boolean {
    // Check HTTP status codes that might indicate MFA required
    if (response.status === 401 || response.status === 403) {
      // Check for specific error codes
      if (error.code === 'AUTH_002' || error.code === 'MFA_REQUIRED') {
        return true;
      }
      
      // Check for MFA hint in details
      if (error.details?.mfaRequired === true) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if error is MFA required error
   */
  private isMfaRequiredError(error: any): error is MfaRequiredError {
    return error && 
           typeof error === 'object' && 
           error.code === 'AUTH_002' && 
           error.details?.mfaRequired === true;
  }

  /**
   * Map HTTP status to error code
   */
  private mapHttpStatusToErrorCode(status: number): string {
    switch (status) {
      case 400:
        return 'VAL_001'; // Validation error
      case 401:
        return 'AUTH_001'; // Authentication required
      case 403:
        return 'AUTH_002'; // Authorization failed (might be MFA)
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'BIZ_002'; // Business logic conflict
      case 422:
        return 'VAL_001'; // Validation error
      case 429:
        return 'RATE_LIMIT';
      case 500:
        return 'SYS_001'; // System error
      case 502:
      case 503:
      case 504:
        return 'SYS_002'; // Service unavailable
      default:
        return 'UNKNOWN_ERROR';
    }
  }

  /**
   * Wrap non-HTTP errors
   */
  private wrapError(error: any, correlationId: string): ErrorLike {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: { originalError: error.message },
        correlationId,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: { originalError: error },
      correlationId,
    };
  }

  /**
   * Generate correlation ID
   */
  private generateCorrelationId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `req-${timestamp}-${random}`;
  }

  /**
   * Set default headers
   */
  setDefaultHeaders(headers: HeadersInit): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Set base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Extract endpoint identifier from URL and method
   */
  private extractEndpoint(url: string, method: string): string {
    // Remove base URL if present
    let path = url;
    if (this.baseUrl && url.startsWith(this.baseUrl)) {
      path = url.substring(this.baseUrl.length);
    }

    // Remove query parameters
    const pathWithoutQuery = path.split('?')[0];

    // Replace path parameters with placeholders
    let endpoint = pathWithoutQuery
      .replace(/\/\d+/g, '/{id}') // Replace numeric IDs
      .replace(/\/[a-f0-9-]{36}/g, '/{id}') // Replace UUIDs
      .replace(/\/[A-Z0-9-]+$/g, '/{id}'); // Replace other ID patterns

    return `${method.toUpperCase()} ${endpoint}`;
  }
}

// Singleton instance
let httpClientInstance: HttpClient | null = null;

export function getHttpClient(): HttpClient {
  if (!httpClientInstance) {
    httpClientInstance = new HttpClient();
  }
  return httpClientInstance;
}

// Convenience functions
export async function httpGet<T = any>(
  url: string,
  options?: Omit<HttpRequestOptions, 'method' | 'body'>
): Promise<HttpResponse<T>> {
  return getHttpClient().get<T>(url, options);
}

export async function httpPost<T = any>(
  url: string,
  data?: any,
  options?: Omit<HttpRequestOptions, 'method' | 'body'>
): Promise<HttpResponse<T>> {
  return getHttpClient().post<T>(url, data, options);
}

export async function httpPut<T = any>(
  url: string,
  data?: any,
  options?: Omit<HttpRequestOptions, 'method' | 'body'>
): Promise<HttpResponse<T>> {
  return getHttpClient().put<T>(url, data, options);
}

export async function httpPatch<T = any>(
  url: string,
  data?: any,
  options?: Omit<HttpRequestOptions, 'method' | 'body'>
): Promise<HttpResponse<T>> {
  return getHttpClient().patch<T>(url, data, options);
}

export async function httpDelete<T = any>(
  url: string,
  options?: Omit<HttpRequestOptions, 'method' | 'body'>
): Promise<HttpResponse<T>> {
  return getHttpClient().delete<T>(url, options);
}

// MFA-specific helpers
export function createMfaRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  data?: any,
  mfaHeaders?: { 'X-MFA-Token': string; 'X-MFA-OTP': string }
): Promise<HttpResponse> {
  const client = getHttpClient();
  
  switch (method) {
    case 'GET':
      return client.get(url, { mfaHeaders });
    case 'POST':
      return client.post(url, data, { mfaHeaders });
    case 'PUT':
      return client.put(url, data, { mfaHeaders });
    case 'PATCH':
      return client.patch(url, data, { mfaHeaders });
    case 'DELETE':
      return client.delete(url, { mfaHeaders });
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

// Error type guards
export function isMfaRequiredError(error: any): error is MfaRequiredError {
  return error && 
         typeof error === 'object' && 
         error.code === 'AUTH_002' && 
         error.details?.mfaRequired === true;
}

export function isNetworkError(error: any): boolean {
  return error && typeof error === 'object' && error.code === 'NETWORK_ERROR';
}

export function isValidationError(error: any): boolean {
  return error && typeof error === 'object' && error.code === 'VAL_001';
}

export function isSystemError(error: any): boolean {
  return error && typeof error === 'object' && error.code.startsWith('SYS_');
}

/**
 * Set validation entry callback (dev-only)
 * Called by SchemaOverlay to receive validation entries
 */
export function setValidationEntryCallback(callback: (endpoint: string, data: any, isRequest: boolean) => void): void {
  if (process.env.NODE_ENV === 'development') {
    addValidationEntry = callback;
  }
}
