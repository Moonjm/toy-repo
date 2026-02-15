import dayjs from 'dayjs';
import type { PairEvent } from '../../api/pairEvents';

type SheetHeaderProps = {
  selectedKey: string | null;
  pairEventsByDate: Record<string, PairEvent[]>;
  birthdayMap: Record<string, { emoji: string; label: string }[]>;
  holidayMap: Record<string, string[]>;
};

export default function SheetHeader({
  selectedKey,
  pairEventsByDate,
  birthdayMap,
  holidayMap,
}: SheetHeaderProps) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-base font-semibold text-slate-800">
          {selectedKey ? dayjs(selectedKey).format('M월 D일 dddd') : '날짜를 선택하세요'}
        </span>
        {selectedKey &&
          (pairEventsByDate[selectedKey] ?? []).map((event) => (
            <span
              key={`ev-${event.id}`}
              className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"
            >
              {event.emoji} {event.title}
            </span>
          ))}
        {selectedKey &&
          (birthdayMap[selectedKey] ?? []).map((b, i) => (
            <span
              key={`bd-${i}`}
              className="rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-xs font-semibold text-pink-700"
            >
              {b.emoji} {b.label}
            </span>
          ))}
      </div>
      {selectedKey && holidayMap[selectedKey] && holidayMap[selectedKey].length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          {holidayMap[selectedKey].map((name) => (
            <span
              key={`${selectedKey}-${name}`}
              className="rounded-full bg-red-50 px-3 py-1 font-semibold text-red-600"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
