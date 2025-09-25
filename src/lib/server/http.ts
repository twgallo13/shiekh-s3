/**
 * Server-Side HTTP Client
 * Minimal fetch wrapper for server-side API calls
 * No window, no dev overlays, no client-side features
 */

export interface ServerHttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

export interface ServerHttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  ok: boolean;
}

export class ServerHttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '', defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders
    };
  }

  /**
   * Make HTTP request (server-side only)
   */
  async request<T = any>(
    url: string,
    options: ServerHttpRequestOptions = {}
  ): Promise<ServerHttpResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 10000
    } = options;

    // Build full URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

    // Prepare headers
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers
    };

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    // Add body for non-GET requests
    if (body && method !== 'GET') {
      if (typeof body === 'string') {
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(fullUrl, requestOptions);
      clearTimeout(timeoutId);

      // Parse response
      let data: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text() as T;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        ok: response.ok
      };
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, body?: any, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, body?: any, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, body?: any, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }
}

// Default server HTTP client instance
export const serverHttp = new ServerHttpClient();

// Convenience functions
export async function serverGet<T = any>(url: string, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
  return serverHttp.get<T>(url, options);
}

export async function serverPost<T = any>(url: string, body?: any, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
  return serverHttp.post<T>(url, body, options);
}

export async function serverPut<T = any>(url: string, body?: any, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
  return serverHttp.put<T>(url, body, options);
}

export async function serverDelete<T = any>(url: string, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
  return serverHttp.delete<T>(url, options);
}

export async function serverPatch<T = any>(url: string, body?: any, options?: Omit<ServerHttpRequestOptions, 'method' | 'body'>): Promise<ServerHttpResponse<T>> {
  return serverHttp.patch<T>(url, body, options);
}
