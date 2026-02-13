import { getApiClient, type DataResponse } from '@repo/api';
import type { DailyRecord } from './dailyRecords';

export type PairStatus = 'PENDING' | 'CONNECTED';

export type PairResponse = {
  id: number;
  status: PairStatus;
  partnerName: string | null;
  connectedAt: string | null;
  partnerGender: 'MALE' | 'FEMALE' | null;
  partnerBirthDate: string | null;
};

export type PairInviteResponse = {
  inviteCode: string;
};

export function getPairStatus(): Promise<DataResponse<PairResponse | null>> {
  return getApiClient().get<DataResponse<PairResponse | null>>('/pair');
}

export function createInvite(): Promise<DataResponse<PairInviteResponse>> {
  return getApiClient().post<DataResponse<PairInviteResponse>>('/pair/invite');
}

export function acceptInvite(inviteCode: string): Promise<DataResponse<PairResponse>> {
  return getApiClient().post<DataResponse<PairResponse>>('/pair/accept', { inviteCode });
}

export function unpair(): Promise<void> {
  return getApiClient().delete<void>('/pair');
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
  return getApiClient().get<DataResponse<DailyRecord[]>>(
    `/pair/daily-records${suffix ? `?${suffix}` : ''}`
  );
}
