import { getApiClient, type DataResponse } from '@repo/api';

export type HolidaysResponse = DataResponse<Record<string, string[]>>;

export function fetchHolidays(year: string): Promise<HolidaysResponse> {
  return getApiClient().get<HolidaysResponse>('/holidays', {
    params: { year },
  });
}
