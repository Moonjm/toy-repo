import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const y = dayjs(visibleMonthRef.current + '-01').year();
      const row = yearScrollRef.current?.querySelector(`[data-year="${y}"]`) as HTMLElement | null;
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
          {Array.from({ length: 20 }, (_, i) => 2018 + i).map((y) => {
            const isSelected = dayjs(visibleMonth + '-01').year() === y;
            return (
              <button
                key={y}
                data-year={y}
                type="button"
                className={`snap-center px-3 py-2 text-center text-sm ${
                  isSelected ? 'font-bold text-slate-900' : 'text-slate-400'
                }`}
                onClick={() => onSelectMonth(dayjs(visibleMonth + '-01').year(y))}
              >
                {y}년
              </button>
            );
          })}
        </div>
        <div className="flex h-48 w-20 snap-y snap-mandatory flex-col overflow-y-auto overscroll-contain">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isSelected = dayjs(visibleMonth + '-01').month() + 1 === m;
            return (
              <button
                key={m}
                type="button"
                className={`snap-center px-3 py-2 text-center text-sm ${
                  isSelected ? 'font-bold text-slate-900' : 'text-slate-400'
                }`}
                onClick={() => onSelectMonth(dayjs(visibleMonth + '-01').month(m - 1))}
              >
                {m}월
              </button>
            );
          })}
        </div>
      </div>
      {open && <div className="absolute inset-0 z-20" onClick={onClose} />}
    </>
  );
}
