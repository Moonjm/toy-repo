import { getApiClient, type DataResponse } from '@repo/api';

export type Gender = 'MALE' | 'FEMALE';

export type User = {
  id: number;
  username: string;
  name: string | null;
  authority: string;
  gender: Gender | null;
  birthDate: string | null;
};

export function fetchMe(): Promise<DataResponse<User>> {
  return getApiClient().get<DataResponse<User>>('/users/me');
}

export type UpdateMeRequest = {
  name?: string | null;
  gender?: Gender | null;
  birthDate?: string | null;
  currentPassword?: string | null;
  password?: string | null;
};

export function updateMe(payload: UpdateMeRequest): Promise<DataResponse<User>> {
  return getApiClient().patch<DataResponse<User>>('/users/me', payload);
}
