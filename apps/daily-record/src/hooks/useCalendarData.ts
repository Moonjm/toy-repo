import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { fetchHolidays } from '../api/holidays';
import { fetchCategories, type Category } from '../api/categories';
import {
  fetchDailyRecords,
  fetchDailyOvereats,
  type DailyRecord,
  type OvereatLevel,
} from '../api/dailyRecords';
import { getPairStatus, fetchPartnerDailyRecords, type PairResponse } from '../api/pair';
import { fetchPairEvents, type PairEvent } from '../api/pairEvents';

export function useCalendarData(months: dayjs.Dayjs[], visibleMonth: string) {
  const [recordsByDate, setRecordsByDate] = useState<Record<string, DailyRecord[]>>({});
  const [partnerRecordsByDate, setPartnerRecordsByDate] = useState<Record<string, DailyRecord[]>>(
    {}
  );
  const [pairEventsByDate, setPairEventsByDate] = useState<Record<string, PairEvent[]>>({});
  const [overeatByDate, setOvereatByDate] = useState<Record<string, OvereatLevel>>({});
  const [holidayMap, setHolidayMap] = useState<Record<string, string[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [pairInfo, setPairInfo] = useState<PairResponse | null>(null);

  const holidayCacheRef = useRef<Record<string, boolean>>({});
  const loadedMonthsRef = useRef({
    records: new Set<string>(),
    partner: new Set<string>(),
    events: new Set<string>(),
    overeats: new Set<string>(),
  });

  const isPaired = pairInfo?.status === 'CONNECTED';

  // Use ref for visibleMonth to avoid effect re-triggering on scroll
  const visibleMonthRef = useRef(visibleMonth);
  visibleMonthRef.current = visibleMonth;

  /* ---------- Load functions ---------- */

  const loadMonthRecords = useCallback((targetMonth: Date) => {
    const mk = dayjs(targetMonth).format('YYYY-MM');
    if (loadedMonthsRef.current.records.has(mk)) return;
    loadedMonthsRef.current.records.add(mk);
    const from = dayjs(targetMonth).startOf('month').format('YYYY-MM-DD');
    const to = dayjs(targetMonth).endOf('month').format('YYYY-MM-DD');
    fetchDailyRecords({ from, to })
      .then((res) => {
        setRecordsByDate((prev) => {
          const next = { ...prev };
          (res.data ?? []).forEach((record) => {
            const key = dayjs(record.date).format('YYYY-MM-DD');
            if (!next[key]) next[key] = [];
            next[key].push(record);
          });
          return next;
        });
      })
      .catch(() => {
        loadedMonthsRef.current.records.delete(mk);
      });
  }, []);

  const loadPartnerRecords = useCallback(
    (targetMonth: Date) => {
      if (!pairInfo || pairInfo.status !== 'CONNECTED') return;
      const mk = dayjs(targetMonth).format('YYYY-MM');
      if (loadedMonthsRef.current.partner.has(mk)) return;
      loadedMonthsRef.current.partner.add(mk);
      const from = dayjs(targetMonth).startOf('month').format('YYYY-MM-DD');
      const to = dayjs(targetMonth).endOf('month').format('YYYY-MM-DD');
      fetchPartnerDailyRecords({ from, to })
        .then((res) => {
          setPartnerRecordsByDate((prev) => {
            const next = { ...prev };
            (res.data ?? []).forEach((record) => {
              const key = dayjs(record.date).format('YYYY-MM-DD');
              if (!next[key]) next[key] = [];
              next[key].push(record);
            });
            return next;
          });
        })
        .catch(() => {
          loadedMonthsRef.current.partner.delete(mk);
        });
    },
    [pairInfo]
  );

  const loadPairEvents = useCallback(
    (targetMonth: Date) => {
      if (!pairInfo || pairInfo.status !== 'CONNECTED') return;
      const mk = dayjs(targetMonth).format('YYYY-MM');
      if (loadedMonthsRef.current.events.has(mk)) return;
      loadedMonthsRef.current.events.add(mk);
      const from = dayjs(targetMonth).startOf('month').format('YYYY-MM-DD');
      const to = dayjs(targetMonth).endOf('month').format('YYYY-MM-DD');
      fetchPairEvents({ from, to })
        .then((res) => {
          setPairEventsByDate((prev) => {
            const next = { ...prev };
            (res.data ?? []).forEach((event) => {
              const eventMonth = event.eventDate.substring(5, 7);
              const eventDay = event.eventDate.substring(8, 10);
              const year = dayjs(targetMonth).year();
              const key = `${year}-${eventMonth}-${eventDay}`;
              if (!next[key]) next[key] = [];
              next[key].push(event);
            });
            return next;
          });
        })
        .catch(() => {
          loadedMonthsRef.current.events.delete(mk);
        });
    },
    [pairInfo]
  );

  const loadOvereats = useCallback((targetMonth: Date) => {
    const mk = dayjs(targetMonth).format('YYYY-MM');
    if (loadedMonthsRef.current.overeats.has(mk)) return;
    loadedMonthsRef.current.overeats.add(mk);
    const from = dayjs(targetMonth).startOf('month').format('YYYY-MM-DD');
    const to = dayjs(targetMonth).endOf('month').format('YYYY-MM-DD');
    fetchDailyOvereats(from, to)
      .then((res) => {
        setOvereatByDate((prev) => {
          const next = { ...prev };
          (res.data ?? []).forEach((item) => {
            next[item.date] = item.overeatLevel;
          });
          return next;
        });
      })
      .catch(() => {
        loadedMonthsRef.current.overeats.delete(mk);
      });
  }, []);

  const loadMonthData = useCallback(
    (targetMonth: Date) => {
      loadMonthRecords(targetMonth);
      loadPartnerRecords(targetMonth);
      loadPairEvents(targetMonth);
      loadOvereats(targetMonth);
    },
    [loadMonthRecords, loadPartnerRecords, loadPairEvents, loadOvereats]
  );

  const reloadMonthRecords = useCallback(async (targetDate: Date) => {
    const from = dayjs(targetDate).startOf('month').format('YYYY-MM-DD');
    const to = dayjs(targetDate).endOf('month').format('YYYY-MM-DD');
    try {
      const [res, ovRes] = await Promise.all([
        fetchDailyRecords({ from, to }),
        fetchDailyOvereats(from, to),
      ]);
      setRecordsByDate((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key >= from && key <= to) delete next[key];
        });
        (res.data ?? []).forEach((record) => {
          const key = dayjs(record.date).format('YYYY-MM-DD');
          if (!next[key]) next[key] = [];
          next[key].push(record);
        });
        return next;
      });
      setOvereatByDate((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (key >= from && key <= to) delete next[key];
        });
        (ovRes.data ?? []).forEach((item) => {
          next[item.date] = item.overeatLevel;
        });
        return next;
      });
    } catch {
      /* ignore */
    }
  }, []);

  /* ---------- Initial data loading ---------- */

  // Holidays
  useEffect(() => {
    const years = new Set(months.map((m) => String(m.year())));
    years.forEach((year) => {
      if (holidayCacheRef.current[year]) return;
      fetchHolidays(year)
        .then((res) => {
          if (!Array.isArray(res?.data)) return;
          setHolidayMap((prev) => {
            const next = { ...prev };
            res.data.forEach(
              (item: { date: string; localName?: string | null; name?: string | null }) => {
                const key = dayjs(item.date).format('YYYY-MM-DD');
                const label = item.localName ?? item.name;
                if (!label) return;
                if (!next[key]) next[key] = [];
                next[key].push(label);
              }
            );
            return next;
          });
          holidayCacheRef.current[year] = true;
        })
        .catch(() => {});
    });
  }, [months]);

  // Categories
  useEffect(() => {
    let cancelled = false;
    fetchCategories(true)
      .then((res) => {
        if (cancelled) return;
        setCategories(res.data ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Pair status
  useEffect(() => {
    let cancelled = false;
    getPairStatus()
      .then((res) => {
        if (cancelled) return;
        setPairInfo(res.data ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Load partner data after pair info loads
  useEffect(() => {
    if (!isPaired) return;
    const current = dayjs(visibleMonthRef.current + '-01');
    [current.subtract(1, 'month'), current, current.add(1, 'month')].forEach((m) => {
      loadPartnerRecords(m.toDate());
      loadPairEvents(m.toDate());
    });
  }, [isPaired, loadPartnerRecords, loadPairEvents]);

  return {
    recordsByDate,
    partnerRecordsByDate,
    pairEventsByDate,
    overeatByDate,
    holidayMap,
    categories,
    pairInfo,
    isPaired,
    loadMonthData,
    reloadMonthRecords,
  };
}
