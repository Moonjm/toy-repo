import { getJson, patchJson } from './client';

export type User = {
  id: number;
  username: string;
  name: string | null;
  authority: string;
};

export type DataResponse<T> = {
  data: T;
  status: number;
  message?: string | null;
  timestamp: string;
};

export function fetchMe(): Promise<DataResponse<User>> {
  return getJson<DataResponse<User>>('/users/me');
}

export type UpdateMeRequest = {
  name?: string | null;
  currentPassword?: string | null;
  password?: string | null;
};

export function updateMe(payload: UpdateMeRequest): Promise<DataResponse<User>> {
  return patchJson<DataResponse<User>>('/users/me', payload);
}
