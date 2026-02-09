const apiBase = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

class ApiError extends Error {
  status: number;
  body?: JsonValue;

  constructor(message: string, status: number, body?: JsonValue) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    if (res.status === 401) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        return requestJson<T>(input, init);
      }
    }
    throw new ApiError('Request failed', res.status, body);
  }

  return body as T;
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${apiBase}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export function getJson<T>(path: string): Promise<T> {
  return requestJson<T>(`${apiBase}${path}`);
}

export function postJson<T>(path: string, body?: JsonValue): Promise<T> {
  return requestJson<T>(`${apiBase}${path}`, {
    method: 'POST',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function putJson<T>(path: string, body?: JsonValue): Promise<T> {
  return requestJson<T>(`${apiBase}${path}`, {
    method: 'PUT',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function patchJson<T>(path: string, body?: JsonValue): Promise<T> {
  return requestJson<T>(`${apiBase}${path}`, {
    method: 'PATCH',
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

export function deleteJson<T>(path: string): Promise<T> {
  return requestJson<T>(`${apiBase}${path}`, { method: 'DELETE' });
}

export { ApiError };
