// API Error types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Response type
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

// API Client configuration
interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private requestInterceptors: Array<(config: RequestInit) => RequestInit> = [];
  private responseInterceptors: Array<(response: any) => any> = [];

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 10000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    // Set up default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Set up default request and response interceptors
   */
  private setupDefaultInterceptors(): void {
    // Request interceptor for logging
    this.addRequestInterceptor(config => {
      if (import.meta.env.DEV) {
        console.log('🚀 API Request:', {
          url: config.url || 'Unknown',
          method: config.method || 'GET',
          headers: config.headers,
        });
      }
      return config;
    });

    // Response interceptor for logging and error handling
    this.addResponseInterceptor(response => {
      if (import.meta.env.DEV) {
        console.log('✅ API Response:', response);
      }
      return response;
    });
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: (config: RequestInit) => RequestInit): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: (response: any) => any): void {
    this.responseInterceptors.push(interceptor);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Apply request interceptors
    let requestConfig: RequestInit = {
      ...options,
      url,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    for (const interceptor of this.requestInterceptors) {
      requestConfig = interceptor(requestConfig);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle authentication errors
        if (response.status === 401) {
          // Clear stored token on unauthorized
          localStorage.removeItem('api_token');
          this.removeHeader('Authorization');
        }

        throw new ApiError(
          errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        );
      }

      let data = await response.json();

      // Apply response interceptors
      for (const interceptor of this.responseInterceptors) {
        data = interceptor(data);
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408, 'Request Timeout');
        }
        throw new ApiError(error.message, 0, 'Network Error');
      }

      throw new ApiError('Unknown error occurred', 0, 'Unknown Error');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Method to update headers (useful for auth tokens)
  setHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeHeader(key: string): void {
    delete this.defaultHeaders[key];
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.setHeader('Authorization', `Bearer ${token}`);
    localStorage.setItem('api_token', token);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.removeHeader('Authorization');
    localStorage.removeItem('api_token');
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
});

// Set up authentication token if available
const token = localStorage.getItem('api_token') || import.meta.env.VITE_API_TOKEN;
if (token) {
  apiClient.setHeader('Authorization', `Bearer ${token}`);
}

export default apiClient;
