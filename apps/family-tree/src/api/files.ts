import { postForLocationId } from './postForLocationId';

export function uploadFile(file: File): Promise<number> {
  const formData = new FormData();
  formData.append('file', file);
  return postForLocationId('/files', formData);
}
