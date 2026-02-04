import { deleteJson, getJson, postJson, putJson } from './client';
import type { Category } from './categories';

export type DailyRecord = {
  id: number;
  date: string;
  memo: string | null;
  category: Category;
};

export type DailyRecordRequest = {
  date: string;
  categoryId: number;
  memo: string | null;
};

export type DataResponse<T> = {
  data: T;
  status: number;
  message?: string | null;
  timestamp: string;
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
  return getJson<DataResponse<DailyRecord[]>>(`/daily-records${suffix ? `?${suffix}` : ''}`);
}

export function createDailyRecord(payload: DailyRecordRequest): Promise<number> {
  return postJson<number>('/daily-records', payload);
}

export function updateDailyRecord(id: number, payload: DailyRecordRequest): Promise<void> {
  return putJson<void>(`/daily-records/${id}`, payload);
}

export function deleteDailyRecord(id: number): Promise<void> {
  return deleteJson<void>(`/daily-records/${id}`);
}
