const apiBase = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

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
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const body = isJson ? await res.json() : undefined;

  if (!res.ok) {
    throw new ApiError('Request failed', res.status, body);
  }

  return body as T;
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

export function deleteJson<T>(path: string): Promise<T> {
  return requestJson<T>(`${apiBase}${path}`, { method: 'DELETE' });
}

export { ApiError };
