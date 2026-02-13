import { getApiClient, type DataResponse } from '@repo/api';
import type { Category } from './categories';

export type { DataResponse };

export type OvereatLevel = 'NONE' | 'MILD' | 'MODERATE' | 'SEVERE';

export type DailyRecord = {
  id: number;
  date: string;
  memo: string | null;
  category: Category;
  together: boolean;
};

export type DailyRecordRequest = {
  date: string;
  categoryId: number;
  memo: string | null;
  together: boolean;
};

type DailyRecordQuery = {
  date?: string;
  from?: string;
  to?: string;
};

export function fetchDailyRecords(
  query: DailyRecordQuery = {}
): Promise<DataResponse<DailyRecord[]>> {
  const params = new URLSearchParams();
  if (query.date) params.set('date', query.date);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  const suffix = params.toString();
  return getApiClient().get<DataResponse<DailyRecord[]>>(
    `/daily-records${suffix ? `?${suffix}` : ''}`
  );
}

export function createDailyRecord(payload: DailyRecordRequest): Promise<number> {
  return getApiClient().post<number>('/daily-records', payload);
}

export function updateDailyRecord(id: number, payload: DailyRecordRequest): Promise<void> {
  return getApiClient().put<void>(`/daily-records/${id}`, payload);
}

export function deleteDailyRecord(id: number): Promise<void> {
  return getApiClient().delete<void>(`/daily-records/${id}`);
}

export type DailyOvereat = {
  date: string;
  overeatLevel: OvereatLevel;
};

export function fetchDailyOvereats(
  from: string,
  to: string
): Promise<DataResponse<DailyOvereat[]>> {
  return getApiClient().get<DataResponse<DailyOvereat[]>>(
    `/daily-overeats?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
  );
}

export function updateOvereatLevel(date: string, overeatLevel: OvereatLevel): Promise<void> {
  return getApiClient().put<void>('/daily-overeats', { date, overeatLevel });
}
