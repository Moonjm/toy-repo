import type { DailyRecord, OvereatLevel } from '../api/dailyRecords';
import type { PairEvent } from '../api/pairEvents';

export type CalendarDataMaps = {
  recordsByDate: Record<string, DailyRecord[]>;
  partnerRecordsByDate: Record<string, DailyRecord[]>;
  pairEventsByDate: Record<string, PairEvent[]>;
  overeatByDate: Record<string, OvereatLevel>;
  holidayMap: Record<string, string[]>;
  birthdayMap: Record<string, { emoji: string; label: string }[]>;
};
