const BASE_URL = (import.meta.env.VITE_API_BASE ?? '/api').replace(/\/$/, '');

export async function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/files`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`File upload failed: ${response.status}`);
  }

  const location = response.headers.get('Location') ?? '';
  const match = location.match(/\/files\/(\d+)/);
  if (!match) {
    throw new Error('File ID not found in Location header');
  }

  return Number(match[1]);
}
