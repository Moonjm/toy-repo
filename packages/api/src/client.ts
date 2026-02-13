import { ApiError } from './error';
import type { ApiClientConfig, RequestOptions } from './types';

export function createApiClient(config: ApiClientConfig) {
  const { baseURL, refreshTokenURL = '/auth/refresh', onUnauthorized } = config;

  let isRefreshing = false;
  let refreshPromise: Promise<boolean> | null = null;

  function buildURL(path: string, params?: RequestOptions['params']): string {
    let fullPath = `${baseURL}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.set(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullPath += `?${queryString}`;
      }
    }

    return fullPath;
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(buildURL(refreshTokenURL), {
        method: 'POST',
        credentials: 'include',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async function handleUnauthorized(): Promise<boolean> {
    if (isRefreshing && refreshPromise) {
      return refreshPromise;
    }

    isRefreshing = true;
    refreshPromise = refreshToken();

    const success = await refreshPromise;

    isRefreshing = false;
    refreshPromise = null;

    if (!success && onUnauthorized) {
      onUnauthorized();
    }

    return success;
  }

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {},
    isRetry = false
  ): Promise<T> {
    const { params, headers: customHeaders, ...restOptions } = options;

    const url = buildURL(path, params);
    const isFormData = body instanceof FormData;

    const headers: HeadersInit = {
      ...(body !== undefined && !isFormData && { 'Content-Type': 'application/json' }),
      ...customHeaders,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) : undefined,
      credentials: 'include',
      ...restOptions,
    });

    if (response.status === 401 && !isRetry) {
      const refreshed = await handleUnauthorized();
      if (refreshed) {
        return request<T>(method, path, body, options, true);
      }
    }

    if (!response.ok) {
      throw await ApiError.fromResponse(response);
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return (await response.json()) as T;
    }

    return undefined as T;
  }

  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('GET', path, undefined, options);
    },

    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('POST', path, body, options);
    },

    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PUT', path, body, options);
    },

    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PATCH', path, body, options);
    },

    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('DELETE', path, undefined, options);
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;

let client: ApiClient | null = null;

export const configureApi = (config: ApiClientConfig) => {
  client = createApiClient(config);
};

export const getApiClient = (): ApiClient => {
  if (!client) {
    throw new Error('API client not configured. Call configureApi() first.');
  }
  return client;
};
