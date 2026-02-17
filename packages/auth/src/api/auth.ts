import { getApiClient } from '@repo/api';

export type AuthRequest = {
  username: string;
  password: string;
};

export function login(payload: AuthRequest): Promise<void> {
  return getApiClient().post<void>('/auth/login', payload);
}

export function logout(): Promise<void> {
  return getApiClient().post<void>('/auth/logout');
}
