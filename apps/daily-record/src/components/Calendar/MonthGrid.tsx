import dayjs from 'dayjs';
import DayCell from './DayCell';
import type { CalendarDataMaps } from '../../types/calendar';

function getMonthCells(monthStart: dayjs.Dayjs): (dayjs.Dayjs | null)[] {
  const first = monthStart.startOf('month');
  const startDay = first.day();
  const daysInMonth = first.daysInMonth();
  const cells: (dayjs.Dayjs | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 0; d < daysInMonth; d++) cells.push(first.add(d, 'day'));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

type MonthGridProps = {
  months: dayjs.Dayjs[];
  data: CalendarDataMaps;
  isPaired: boolean;
  onSelectDate: (date: Date) => void;
  setSentinelRef: (key: string, el: HTMLDivElement | null) => void;
};

export default function MonthGrid({
  months,
  data,
  isPaired,
  onSelectDate,
  setSentinelRef,
}: MonthGridProps) {
  return (
    <>
      {months.map((m) => {
        const key = m.format('YYYY-MM');
        const cells = getMonthCells(m);
        return (
          <div key={key}>
            <div ref={(el) => setSentinelRef(key, el)} data-month={key} className="h-0" />
            <div className="sticky top-0 z-10 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-500 backdrop-blur-sm">
              {m.format('YYYY년 M월')}
            </div>
            <div className="cal-grid">
              {cells.map((day, i) =>
                day ? (
                  <DayCell
                    key={day.format('YYYY-MM-DD')}
                    date={day}
                    data={data}
                    isPaired={isPaired}
                    onSelect={onSelectDate}
                  />
                ) : (
                  <div key={`empty-${key}-${i}`} className="cal-cell" />
                )
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
