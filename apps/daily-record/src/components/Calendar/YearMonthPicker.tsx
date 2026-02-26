import { useEffect, useMemo, useRef } from 'react';
import dayjs from 'dayjs';

type YearMonthPickerProps = {
  open: boolean;
  visibleMonth: string;
  onClose: () => void;
  onSelectMonth: (target: dayjs.Dayjs) => void;
};

export default function YearMonthPicker({
  open,
  visibleMonth,
  onClose,
  onSelectMonth,
}: YearMonthPickerProps) {
  const yearScrollRef = useRef<HTMLDivElement>(null);

  const visibleMonthRef = useRef(visibleMonth);
  visibleMonthRef.current = visibleMonth;

  const currentMonth = useMemo(() => dayjs(visibleMonth + '-01'), [visibleMonth]);
  const selectedYear = currentMonth.year();
  const selectedMonthNum = currentMonth.month() + 1;

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const row = yearScrollRef.current?.querySelector(
        `[data-year="${dayjs(visibleMonthRef.current + '-01').year()}"]`
      ) as HTMLElement | null;
      if (row && yearScrollRef.current) {
        yearScrollRef.current.scrollTop =
          row.offsetTop - yearScrollRef.current.offsetHeight / 2 + row.offsetHeight / 2;
      }
    });
  }, [open]);

  return (
    <>
      <div
        className={`absolute inset-x-0 top-0 z-30 flex justify-center gap-0 bg-white transition-all duration-300 ${
          open
            ? 'translate-y-0 border-b border-slate-100 shadow-md'
            : '-translate-y-full border-b border-transparent shadow-none'
        }`}
      >
        <div
          ref={yearScrollRef}
          className="flex h-48 w-28 snap-y snap-mandatory flex-col overflow-y-auto overscroll-contain"
        >
          {Array.from({ length: 20 }, (_, i) => 2018 + i).map((y) => (
            <button
              key={y}
              data-year={y}
              type="button"
              className={`snap-center px-3 py-2 text-center text-sm ${
                selectedYear === y ? 'font-bold text-slate-900' : 'text-slate-400'
              }`}
              onClick={() => onSelectMonth(currentMonth.year(y))}
            >
              {y}년
            </button>
          ))}
        </div>
        <div className="flex h-48 w-20 snap-y snap-mandatory flex-col overflow-y-auto overscroll-contain">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <button
              key={m}
              type="button"
              className={`snap-center px-3 py-2 text-center text-sm ${
                selectedMonthNum === m ? 'font-bold text-slate-900' : 'text-slate-400'
              }`}
              onClick={() => onSelectMonth(currentMonth.month(m - 1))}
            >
              {m}월
            </button>
          ))}
        </div>
      </div>
      {open && (
        <button
          type="button"
          aria-label="피커 닫기"
          className="absolute inset-0 z-20"
          onClick={onClose}
        />
      )}
    </>
  );
}
