import { useCallback, useEffect, useRef } from 'react';
import dayjs from 'dayjs';

type UseCalendarScrollOptions = {
  months: dayjs.Dayjs[];
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  loadMonthData: (targetMonth: Date) => void;
  setVisibleMonth: (month: string) => void;
  extendRangeIfNeeded: (target: dayjs.Dayjs) => void;
};

export function useCalendarScroll({
  months,
  scrollContainerRef,
  loadMonthData,
  setVisibleMonth,
  extendRangeIfNeeded,
}: UseCalendarScrollOptions) {
  const monthSentinelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initialScrollDone = useRef(false);

  /* IntersectionObserver: visible month + lazy loading */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const mk = entry.target.getAttribute('data-month');
            if (mk) {
              setVisibleMonth(mk);
              const d = dayjs(mk + '-01');
              loadMonthData(d.toDate());
              loadMonthData(d.subtract(1, 'month').toDate());
              loadMonthData(d.add(1, 'month').toDate());
            }
          }
        }
      },
      { root: container, rootMargin: '0px 0px -80% 0px', threshold: 0 }
    );

    monthSentinelRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [months, loadMonthData, scrollContainerRef, setVisibleMonth]);

  /* Initial scroll to current month */
  useEffect(() => {
    if (initialScrollDone.current) return;
    const container = scrollContainerRef.current;
    const todayKey = dayjs().format('YYYY-MM');
    const el = monthSentinelRefs.current.get(todayKey);
    if (container && el) {
      container.scrollTop = el.offsetTop + 1;
      initialScrollDone.current = true;
      const today = dayjs();
      loadMonthData(today.toDate());
      loadMonthData(today.subtract(1, 'month').toDate());
      loadMonthData(today.add(1, 'month').toDate());
    }
  }, [months, loadMonthData, scrollContainerRef]);

  /* Scroll to a specific month */
  const scrollToMonth = useCallback(
    (target: dayjs.Dayjs) => {
      extendRangeIfNeeded(target);
      const key = target.format('YYYY-MM');
      setTimeout(() => {
        const el = monthSentinelRefs.current.get(key);
        if (el && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = el.offsetTop + 1;
        }
      }, 50);
    },
    [extendRangeIfNeeded, scrollContainerRef]
  );

  const setSentinelRef = useCallback((key: string, el: HTMLDivElement | null) => {
    if (el) monthSentinelRefs.current.set(key, el);
    else monthSentinelRefs.current.delete(key);
  }, []);

  return { scrollToMonth, setSentinelRef };
}
