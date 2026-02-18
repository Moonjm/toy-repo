import { getApiClient } from '@repo/api';

export function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append('file', file);
  return getApiClient().postForLocationId('/files', formData);
}
