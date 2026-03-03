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

function getMonthRange(targetMonth: Date): { key: string; from: string; to: string } {
  const d = dayjs(targetMonth);
  return {
    key: d.format('YYYY-MM'),
    from: d.startOf('month').format('YYYY-MM-DD'),
    to: d.endOf('month').format('YYYY-MM-DD'),
  };
}

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

  const visibleMonthRef = useRef(visibleMonth);
  visibleMonthRef.current = visibleMonth;

  /* ---------- Load functions ---------- */

  const loadMonthRecords = useCallback((targetMonth: Date) => {
    const { key: mk, from, to } = getMonthRange(targetMonth);
    if (loadedMonthsRef.current.records.has(mk)) return;
    loadedMonthsRef.current.records.add(mk);
    fetchDailyRecords({ from, to })
      .then((res) => {
        setRecordsByDate((prev) => {
          const next = { ...prev };
          (res.data ?? []).forEach((record) => {
            const key = dayjs(record.date).format('YYYY-MM-DD');
            (next[key] ||= []).push(record);
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
      const { key: mk, from, to } = getMonthRange(targetMonth);
      if (loadedMonthsRef.current.partner.has(mk)) return;
      loadedMonthsRef.current.partner.add(mk);
      fetchPartnerDailyRecords({ from, to })
        .then((res) => {
          setPartnerRecordsByDate((prev) => {
            const next = { ...prev };
            (res.data ?? []).forEach((record) => {
              const key = dayjs(record.date).format('YYYY-MM-DD');
              (next[key] ||= []).push(record);
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
      const { key: mk, from, to } = getMonthRange(targetMonth);
      if (loadedMonthsRef.current.events.has(mk)) return;
      loadedMonthsRef.current.events.add(mk);
      fetchPairEvents({ from, to })
        .then((res) => {
          setPairEventsByDate((prev) => {
            const next = { ...prev };
            (res.data ?? []).forEach((event) => {
              const eventMonth = event.eventDate.substring(5, 7);
              const eventDay = event.eventDate.substring(8, 10);
              const year = dayjs(targetMonth).year();
              const key = `${year}-${eventMonth}-${eventDay}`;
              (next[key] ||= []).push(event);
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
    const { key: mk, from, to } = getMonthRange(targetMonth);
    if (loadedMonthsRef.current.overeats.has(mk)) return;
    loadedMonthsRef.current.overeats.add(mk);
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
    const { from, to } = getMonthRange(targetDate);
    try {
      const [res, ovRes] = await Promise.all([
        fetchDailyRecords({ from, to }),
        fetchDailyOvereats(from, to),
      ]);
      setRecordsByDate((prev) => {
        const otherMonths = Object.fromEntries(
          Object.entries(prev).filter(([key]) => key < from || key > to)
        );
        const reloaded = (res.data ?? []).reduce<Record<string, DailyRecord[]>>((acc, record) => {
          const key = dayjs(record.date).format('YYYY-MM-DD');
          (acc[key] ||= []).push(record);
          return acc;
        }, {});
        return { ...otherMonths, ...reloaded };
      });
      setOvereatByDate((prev) => {
        const otherMonths = Object.fromEntries(
          Object.entries(prev).filter(([key]) => key < from || key > to)
        );
        const reloaded = (ovRes.data ?? []).reduce<Record<string, OvereatLevel>>((acc, item) => {
          acc[item.date] = item.overeatLevel;
          return acc;
        }, {});
        return { ...otherMonths, ...reloaded };
      });
    } catch (err) {
      console.error('Failed to reload month records:', err);
      throw err;
    }
  }, []);

  /* ---------- Initial data loading ---------- */

  useEffect(() => {
    const years = new Set(months.map((m) => String(m.year())));
    years.forEach((year) => {
      if (holidayCacheRef.current[year]) return;
      holidayCacheRef.current[year] = true;
      fetchHolidays(year)
        .then((res) => {
          if (!res?.data) return;
          setHolidayMap((prev) => ({ ...prev, ...res.data }));
        })
        .catch(() => {
          holidayCacheRef.current[year] = false;
        });
    });
  }, [months]);

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
