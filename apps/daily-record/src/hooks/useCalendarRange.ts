import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';

const INITIAL_RANGE = 12;

export function useCalendarRange(scrollContainerRef: React.RefObject<HTMLDivElement | null>) {
  const [rangeStart, setRangeStart] = useState(() =>
    dayjs().subtract(INITIAL_RANGE, 'month').startOf('month')
  );
  const [rangeEnd, setRangeEnd] = useState(() =>
    dayjs().add(INITIAL_RANGE, 'month').startOf('month')
  );
  const scrollRestoreRef = useRef<{ prevHeight: number } | null>(null);

  const months = useMemo(() => {
    const result: dayjs.Dayjs[] = [];
    let cur = rangeStart;
    while (cur.isBefore(rangeEnd) || cur.isSame(rangeEnd, 'month')) {
      result.push(cur);
      cur = cur.add(1, 'month');
    }
    return result;
  }, [rangeStart, rangeEnd]);

  /* Scroll position restore after prepend */
  useLayoutEffect(() => {
    if (scrollRestoreRef.current && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTop += el.scrollHeight - scrollRestoreRef.current.prevHeight;
      scrollRestoreRef.current = null;
    }
  }, [rangeStart, scrollContainerRef]);

  /* Infinite scroll */
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (el.scrollTop < 300) {
      scrollRestoreRef.current = { prevHeight: el.scrollHeight };
      setRangeStart((prev) => prev.subtract(6, 'month'));
    }

    if (el.scrollHeight - el.scrollTop - el.clientHeight < 300) {
      setRangeEnd((prev) => prev.add(6, 'month'));
    }
  }, [scrollContainerRef]);

  /* Extend range for scrollToMonth */
  const extendRangeIfNeeded = useCallback(
    (target: dayjs.Dayjs) => {
      if (target.isBefore(rangeStart)) {
        setRangeStart(target.subtract(6, 'month').startOf('month'));
      }
      if (target.isAfter(rangeEnd)) {
        setRangeEnd(target.add(6, 'month').startOf('month'));
      }
    },
    [rangeStart, rangeEnd]
  );

  return { months, handleScroll, extendRangeIfNeeded };
}
