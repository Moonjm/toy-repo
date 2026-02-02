import { getJson } from './client';

export type User = {
  id: number;
  username: string;
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
