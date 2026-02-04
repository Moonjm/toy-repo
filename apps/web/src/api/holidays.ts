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
  return fetch(`/holidays/${encodeURIComponent(year)}.json`, {
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      if (!res.ok) {
        return {
          data: [],
          status: res.status,
          message: 'Failed to load holidays',
          timestamp: new Date().toISOString(),
        };
      }
      const data = (await res.json()) as Record<string, string[]>;
      const list: Holiday[] = Object.entries(data).flatMap(([date, names]) =>
        (names ?? []).map((name) => ({ date, localName: name }))
      );
      return {
        data: list,
        status: 200,
        message: 'success',
        timestamp: new Date().toISOString(),
      };
    })
    .catch((error: unknown) => ({
      data: [],
      status: 500,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }));
}
