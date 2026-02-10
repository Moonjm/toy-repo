import { deleteJson, getJson, postJson } from './client';
import type { DailyRecord, DataResponse } from './dailyRecords';

export type PairStatus = 'PENDING' | 'CONNECTED';

export type PairResponse = {
  id: number;
  status: PairStatus;
  partnerName: string | null;
  connectedAt: string | null;
};

export type PairInviteResponse = {
  inviteCode: string;
};

export function getPairStatus(): Promise<DataResponse<PairResponse | null>> {
  return getJson<DataResponse<PairResponse | null>>('/pair');
}

export function createInvite(): Promise<DataResponse<PairInviteResponse>> {
  return postJson<DataResponse<PairInviteResponse>>('/pair/invite');
}

export function acceptInvite(inviteCode: string): Promise<DataResponse<PairResponse>> {
  return postJson<DataResponse<PairResponse>>('/pair/accept', { inviteCode });
}

export function unpair(): Promise<void> {
  return deleteJson<void>('/pair');
}

type PartnerRecordQuery = {
  date?: string;
  from?: string;
  to?: string;
};

export function fetchPartnerDailyRecords(
  query: PartnerRecordQuery = {}
): Promise<DataResponse<DailyRecord[]>> {
  const params = new URLSearchParams();
  if (query.date) params.set('date', query.date);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  const suffix = params.toString();
  return getJson<DataResponse<DailyRecord[]>>(`/pair/daily-records${suffix ? `?${suffix}` : ''}`);
}
