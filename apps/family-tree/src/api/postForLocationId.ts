const BASE_URL = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

export async function postForLocationId(
  path: string,
  body: BodyInit,
  headers?: HeadersInit
): Promise<number> {
  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`POST ${path} failed: ${response.status} ${response.statusText}`);
  }

  const location = response.headers.get('Location') ?? '';
  const match = location.match(/\/(\d+)$/);
  if (!match) {
    throw new Error(`ID not found in Location header: ${location}`);
  }

  return Number(match[1]);
}
