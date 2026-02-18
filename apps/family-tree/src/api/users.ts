import { getApiClient, type DataResponse } from '@repo/api';
import type { UserItem } from '../types';

export function fetchUsers(): Promise<DataResponse<UserItem[]>> {
  return getApiClient().get<DataResponse<UserItem[]>>('/users');
}
