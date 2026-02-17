import { getApiClient, type DataResponse } from '@repo/api';

export type Authority = 'USER' | 'ADMIN';

export type AdminUser = {
  id: number;
  username: string;
  name: string;
  authority: Authority;
};

export type CreateUserRequest = {
  username: string;
  name: string;
  password: string;
};

export type UpdateUserRequest = {
  password: string;
  name: string;
  authority: Authority;
};

export function fetchAdminUsers(): Promise<DataResponse<AdminUser[]>> {
  return getApiClient().get<DataResponse<AdminUser[]>>('/admin/users');
}

export function createAdminUser(payload: CreateUserRequest): Promise<number> {
  return getApiClient().post<number>('/admin/users', payload);
}

export function updateAdminUser(id: number, payload: UpdateUserRequest): Promise<void> {
  return getApiClient().put<void>(`/admin/users/${id}`, payload);
}

export function deleteAdminUser(id: number): Promise<void> {
  return getApiClient().delete<void>(`/admin/users/${id}`);
}
