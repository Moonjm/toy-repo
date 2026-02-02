import { postJson } from './client';

export type AuthRequest = {
  username: string;
  password: string;
};

export function login(payload: AuthRequest): Promise<void> {
  return postJson<void>('/auth/login', payload);
}

export function logout(): Promise<void> {
  return postJson<void>('/auth/logout');
}
