import { getApiClient, type DataResponse } from '@repo/api';

export type PairEvent = {
  id: number;
  title: string;
  emoji: string;
  eventDate: string;
  recurring: boolean;
};

export type PairEventRequest = {
  title: string;
  emoji: string;
  eventDate: string;
  recurring: boolean;
};

type PairEventQuery = {
  from?: string;
  to?: string;
};

export function fetchPairEvents(query: PairEventQuery = {}): Promise<DataResponse<PairEvent[]>> {
  const params = new URLSearchParams();
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);
  const suffix = params.toString();
  return getApiClient().get<DataResponse<PairEvent[]>>(`/pair/events${suffix ? `?${suffix}` : ''}`);
}

export function createPairEvent(payload: PairEventRequest): Promise<DataResponse<number>> {
  return getApiClient().post<DataResponse<number>>('/pair/events', payload);
}

export function deletePairEvent(id: number): Promise<void> {
  return getApiClient().delete<void>(`/pair/events/${id}`);
}
