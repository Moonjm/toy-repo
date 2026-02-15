import React from 'react';
import dayjs from 'dayjs';
import type { CalendarDataMaps } from '../../types/calendar';

type DayCellProps = {
  date: dayjs.Dayjs;
  data: CalendarDataMaps;
  isPaired: boolean;
  onSelect: (date: Date) => void;
};

const OVEREAT_LEVEL_NUM: Record<string, number> = { MILD: 1, MODERATE: 2, SEVERE: 3, EXTREME: 4 };
const HIGHLIGHT_STYLE: Record<number, string> = {
  1: 'bg-green-100 ring-green-200',
  2: 'bg-orange-200 ring-orange-300',
  3: 'bg-red-200 ring-red-300',
};

const DayCell = React.memo(function DayCell({ date, data, isPaired, onSelect }: DayCellProps) {
  const {
    recordsByDate,
    partnerRecordsByDate,
    pairEventsByDate,
    overeatByDate,
    holidayMap,
    birthdayMap,
  } = data;
  const key = date.format('YYYY-MM-DD');
  const items = recordsByDate[key] || [];
  const partnerItems = partnerRecordsByDate[key] || [];
  const dayEvents = pairEventsByDate[key] || [];
  const birthdays = birthdayMap[key] || [];
  const holidayNames = holidayMap[key];
  const weekday = date.day();
  const isSunday = weekday === 0;
  const isSaturday = weekday === 6;
  const isToday = date.isSame(dayjs(), 'day');

  let dateClass = 'text-slate-800';
  if (holidayNames || isSunday) dateClass = 'text-red-500';
  else if (isSaturday) dateClass = 'text-blue-500';

  const highlightLevel = OVEREAT_LEVEL_NUM[overeatByDate[key] ?? ''] ?? 0;

  const togetherEmojis = isPaired
    ? Array.from(
        new Set([
          ...items.filter((r) => r.together).map((r) => r.category.emoji),
          ...partnerItems.filter((r) => r.together).map((r) => r.category.emoji),
        ])
      )
    : [];
  const myEmojis = isPaired
    ? Array.from(new Set(items.filter((r) => !r.together).map((r) => r.category.emoji)))
    : Array.from(new Set(items.map((r) => r.category.emoji)));
  const partnerEmojis = isPaired
    ? Array.from(new Set(partnerItems.filter((r) => !r.together).map((r) => r.category.emoji)))
    : [];

  return (
    <button
      type="button"
      className="cal-cell w-full bg-transparent focus:outline-none"
      title={holidayNames?.join(', ') || undefined}
      onClick={() => onSelect(date.toDate())}
    >
      <div className="flex h-full w-full flex-col items-center gap-0.5 overflow-hidden pt-1.5">
        <div className="flex items-center justify-center gap-0.5">
          {isToday ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold text-white">
              {date.date()}
            </span>
          ) : (
            <span className={`text-[13px] font-medium ${dateClass}`}>{date.date()}</span>
          )}
          {highlightLevel > 0 && (
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[12px] leading-none ${highlightLevel === 4 ? 'animate-sparkle' : `ring-1 ${HIGHLIGHT_STYLE[highlightLevel]}`}`}
            >
              🐷
            </span>
          )}
        </div>
        {holidayNames && (
          <div className="flex w-full flex-col items-center gap-px px-0.5">
            {holidayNames.slice(0, 2).map((name) => (
              <span
                key={name}
                className="w-full truncate rounded-sm bg-red-50 px-0.5 text-center text-[9px] leading-tight text-red-500"
              >
                {name.replace(/\s*\(.*?\)/g, '')}
              </span>
            ))}
          </div>
        )}
        {(dayEvents.length > 0 || birthdays.length > 0) && (
          <div className="flex flex-wrap justify-center gap-0.5">
            {dayEvents.map((event) => (
              <span key={`ev-${event.id}`} className="text-[10px] leading-tight">
                {event.emoji}
              </span>
            ))}
            {birthdays.map((b, i) => (
              <span key={`bd-${i}`} className="text-[10px] leading-tight">
                {b.emoji}
              </span>
            ))}
          </div>
        )}
        {isPaired ? (
          <>
            {togetherEmojis.length > 0 && (
              <div className="flex flex-wrap justify-center gap-0.5 rounded-full bg-blue-100 px-1">
                {togetherEmojis.map((emoji, i) => (
                  <span key={`t-${i}`} className="text-[10px] leading-tight">
                    {emoji}
                  </span>
                ))}
              </div>
            )}
            {togetherEmojis.length > 0 && (myEmojis.length > 0 || partnerEmojis.length > 0) && (
              <div className="w-3/4 border-t border-dashed border-slate-200" />
            )}
            {(myEmojis.length > 0 || partnerEmojis.length > 0) && (
              <div className="flex w-full items-stretch justify-center gap-0.5">
                <div className="flex flex-col items-center">
                  {myEmojis.map((emoji, i) => (
                    <span key={`m-${i}`} className="text-[10px] leading-tight">
                      {emoji}
                    </span>
                  ))}
                </div>
                {myEmojis.length > 0 && partnerEmojis.length > 0 && (
                  <div className="w-px self-stretch bg-slate-300" />
                )}
                <div className="flex flex-col items-center">
                  {partnerEmojis.map((emoji, i) => (
                    <span key={`p-${i}`} className="text-[10px] leading-tight opacity-60">
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : myEmojis.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-0.5">
            {myEmojis.map((emoji, i) => (
              <span key={`${key}-${i}`} className="text-xs leading-none">
                {emoji}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
});

export default DayCell;
