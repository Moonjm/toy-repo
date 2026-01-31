import { getJson } from './client';

export type Holiday = {
  date: string;
  localName?: string | null;
  name?: string | null;
};

export type HolidaysResponse = {
  data: Holiday[];
  status: number;
  message?: string | null;
  timestamp: string;
};

export function fetchHolidays(year: string): Promise<HolidaysResponse> {
  return getJson<HolidaysResponse>(`/holidays?year=${encodeURIComponent(year)}`);
}
