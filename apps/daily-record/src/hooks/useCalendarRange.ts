import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';

const INITIAL_RANGE = 12;
const SCROLL_THRESHOLD = 300;
const EXTEND_MONTHS = 6;

export function useCalendarRange(scrollContainerRef: React.RefObject<HTMLDivElement | null>) {
  const [rangeStart, setRangeStart] = useState(() =>
    dayjs().subtract(INITIAL_RANGE, 'month').startOf('month')
  );
  const [rangeEnd, setRangeEnd] = useState(() =>
    dayjs().add(INITIAL_RANGE, 'month').startOf('month')
  );
  const scrollRestoreRef = useRef<{ prevHeight: number } | null>(null);
  const isExtendingRef = useRef(false);

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
    if (!el || isExtendingRef.current) return;

    const needsPrepend = el.scrollTop < SCROLL_THRESHOLD;
    const needsAppend = el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;

    if (needsPrepend || needsAppend) {
      isExtendingRef.current = true;

      if (needsPrepend) {
        scrollRestoreRef.current = { prevHeight: el.scrollHeight };
        setRangeStart((prev) => prev.subtract(EXTEND_MONTHS, 'month'));
      }
      if (needsAppend) {
        setRangeEnd((prev) => prev.add(EXTEND_MONTHS, 'month'));
      }

      requestAnimationFrame(() => {
        isExtendingRef.current = false;
      });
    }
  }, [scrollContainerRef]);

  /* Extend range for scrollToMonth */
  const extendRangeIfNeeded = useCallback(
    (target: dayjs.Dayjs) => {
      if (target.isBefore(rangeStart)) {
        setRangeStart(target.subtract(EXTEND_MONTHS, 'month').startOf('month'));
      }
      if (target.isAfter(rangeEnd)) {
        setRangeEnd(target.add(EXTEND_MONTHS, 'month').startOf('month'));
      }
    },
    [rangeStart, rangeEnd]
  );

  return { months, handleScroll, extendRangeIfNeeded };
}
