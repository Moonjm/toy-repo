import { deleteJson, getJson, postJson, putJson } from './client';

export type Authority = 'USER' | 'ADMIN';

export type AdminUser = {
  id: number;
  username: string;
  authority: Authority;
};

export type DataResponse<T> = {
  data: T;
  status: number;
  message?: string | null;
  timestamp: string;
};

export type CreateUserRequest = {
  username: string;
  password: string;
};

export type UpdateUserRequest = {
  password: string;
  authority: Authority;
};

export function fetchAdminUsers(): Promise<DataResponse<AdminUser[]>> {
  return getJson<DataResponse<AdminUser[]>>('/admin/users');
}

export function createAdminUser(payload: CreateUserRequest): Promise<number> {
  return postJson<number>('/admin/users', payload);
}

export function updateAdminUser(id: number, payload: UpdateUserRequest): Promise<void> {
  return putJson<void>(`/admin/users/${id}`, payload);
}

export function deleteAdminUser(id: number): Promise<void> {
  return deleteJson<void>(`/admin/users/${id}`);
}
