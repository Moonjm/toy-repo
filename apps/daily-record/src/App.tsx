import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ConfirmDialog, Input } from '@repo/ui';
import {
  Bars3Icon,
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ChartBarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from './auth/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { fetchHolidays } from './api/holidays';
import { fetchCategories, type Category } from './api/categories';
import {
  createDailyRecord,
  deleteDailyRecord,
  fetchDailyRecords,
  fetchDailyOvereats,
  type DailyRecord,
  type OvereatLevel,
  updateDailyRecord,
  updateOvereatLevel,
} from './api/dailyRecords';
import { getPairStatus, fetchPartnerDailyRecords, type PairResponse } from './api/pair';
import { fetchPairEvents, type PairEvent } from './api/pairEvents';
dayjs.locale('ko');

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const INITIAL_RANGE = 12;

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

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<string>(() => dayjs().format('YYYY-MM'));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recordsByDate, setRecordsByDate] = useState<Record<string, DailyRecord[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [holidayMap, setHolidayMap] = useState<Record<string, string[]>>({});
  const holidayCacheRef = useRef<Record<string, boolean>>({});
  const loadedMonthsRef = useRef({
    records: new Set<string>(),
    partner: new Set<string>(),
    events: new Set<string>(),
    overeats: new Set<string>(),
  });
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [memoInput, setMemoInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const monthSentinelRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initialScrollDone = useRef(false);
  const scrollRestoreRef = useRef<{ prevHeight: number } | null>(null);
  const { user, logout } = useAuth();
  const [pairInfo, setPairInfo] = useState<PairResponse | null>(null);
  const [partnerRecordsByDate, setPartnerRecordsByDate] = useState<Record<string, DailyRecord[]>>(
    {}
  );
  const [pairEventsByDate, setPairEventsByDate] = useState<Record<string, PairEvent[]>>({});
  const [overeatByDate, setOvereatByDate] = useState<Record<string, OvereatLevel>>({});

  const [rangeStart, setRangeStart] = useState(() =>
    dayjs().subtract(INITIAL_RANGE, 'month').startOf('month')
  );
  const [rangeEnd, setRangeEnd] = useState(() =>
    dayjs().add(INITIAL_RANGE, 'month').startOf('month')
  );

  const months = useMemo(() => {
    const result: dayjs.Dayjs[] = [];
    let cur = rangeStart;
    while (cur.isBefore(rangeEnd) || cur.isSame(rangeEnd, 'month')) {
      result.push(cur);
      cur = cur.add(1, 'month');
    }
    return result;
  }, [rangeStart, rangeEnd]);

  const selectedKey = useMemo(
    () => (selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null),
    [selectedDate]
  );

  /* ---------- Data loading (cumulative) ---------- */

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

  /* ---------- Holidays ---------- */

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

  /* ---------- Categories & pair ---------- */

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

  const isPaired = pairInfo?.status === 'CONNECTED';

  const myGenderEmoji = user?.gender === 'MALE' ? '👨' : user?.gender === 'FEMALE' ? '👩' : null;
  const partnerGenderEmoji =
    pairInfo?.partnerGender === 'MALE' ? '👨' : pairInfo?.partnerGender === 'FEMALE' ? '👩' : null;

  const birthdayMap = useMemo(() => {
    const map: Record<string, { emoji: string; label: string }[]> = {};
    const addBirthday = (
      birthDate: string | null | undefined,
      genderEmoji: string | null,
      label: string
    ) => {
      if (!birthDate) return;
      const md = birthDate.substring(5); // MM-DD
      const emoji = genderEmoji ? `🎂${genderEmoji}` : '🎂';
      months.forEach((m) => {
        const key = `${m.year()}-${md}`;
        if (dayjs(key, 'YYYY-MM-DD').isValid() && dayjs(key).month() === m.month()) {
          if (!map[key]) map[key] = [];
          map[key].push({ emoji, label });
        }
      });
    };
    addBirthday(user?.birthDate, myGenderEmoji, '내 생일');
    if (isPaired) {
      addBirthday(
        pairInfo?.partnerBirthDate,
        partnerGenderEmoji,
        `${pairInfo?.partnerName ?? '상대방'} 생일`
      );
    }
    return map;
  }, [user?.birthDate, pairInfo, isPaired, months]);

  /* ---------- IntersectionObserver: visible month + lazy loading ---------- */

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
  }, [months, loadMonthData]);

  /* ---------- Initial scroll to current month ---------- */

  useEffect(() => {
    if (initialScrollDone.current) return;
    const container = scrollContainerRef.current;
    const todayKey = dayjs().format('YYYY-MM');
    const el = monthSentinelRefs.current.get(todayKey);
    if (container && el) {
      container.scrollTop = el.offsetTop + 1;
      initialScrollDone.current = true;
      // Also load initial data
      const today = dayjs();
      loadMonthData(today.toDate());
      loadMonthData(today.subtract(1, 'month').toDate());
      loadMonthData(today.add(1, 'month').toDate());
    }
  });

  /* ---------- Scroll position restore after prepend ---------- */

  useLayoutEffect(() => {
    if (scrollRestoreRef.current && scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      el.scrollTop += el.scrollHeight - scrollRestoreRef.current.prevHeight;
      scrollRestoreRef.current = null;
    }
  }, [rangeStart]);

  /* ---------- Infinite scroll ---------- */

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
  }, []);

  /* ---------- Scroll to month ---------- */

  const scrollToMonth = useCallback(
    (target: dayjs.Dayjs) => {
      const key = target.format('YYYY-MM');
      // Extend range if needed
      if (target.isBefore(rangeStart)) {
        setRangeStart(target.subtract(6, 'month').startOf('month'));
      }
      if (target.isAfter(rangeEnd)) {
        setRangeEnd(target.add(6, 'month').startOf('month'));
      }
      setTimeout(() => {
        const el = monthSentinelRefs.current.get(key);
        if (el && scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = el.offsetTop + 1;
        }
      }, 50);
    },
    [rangeStart, rangeEnd]
  );

  /* ---------- DayCell ---------- */

  const DayCell = ({ date }: { date: dayjs.Dayjs }) => {
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

    const allMyEmojis = Array.from(new Set(items.map((item) => item.category.id))).map(
      (catId) => categories.find((c) => c.id === catId)?.emoji ?? '?'
    );
    const allPartnerEmojis = isPaired
      ? Array.from(new Set(partnerItems.map((item) => item.category.id))).map(
          (catId) => categories.find((c) => c.id === catId)?.emoji ?? '?'
        )
      : [];
    const OVEREAT_LEVEL_NUM: Record<string, number> = { MILD: 1, MODERATE: 2, SEVERE: 3 };
    const highlightLevel = OVEREAT_LEVEL_NUM[overeatByDate[key] ?? ''] ?? 0;
    const HIGHLIGHT_STYLE: Record<number, string> = {
      1: 'bg-green-100 ring-green-200',
      2: 'bg-orange-200 ring-orange-300',
      3: 'bg-red-200 ring-red-300',
    };
    const myEmojis = allMyEmojis;
    const partnerEmojis = allPartnerEmojis;

    return (
      <button
        type="button"
        className="cal-cell w-full bg-transparent focus:outline-none"
        title={holidayNames?.join(', ') || undefined}
        onClick={() => {
          setSelectedDate(date.toDate());
          setEditingRecordId(null);
          setSelectedCategoryId(null);
          setMemoInput('');
          setSheetOpen(true);
        }}
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
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[12px] leading-none ring-1 ${HIGHLIGHT_STYLE[highlightLevel]}`}
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
          {isPaired
            ? (myEmojis.length > 0 || partnerEmojis.length > 0) && (
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
              )
            : myEmojis.length > 0 && (
                <div className="flex flex-wrap justify-center gap-0.5">
                  {myEmojis.map((emoji, i) => (
                    <span key={`${key}-${i}`} className="text-xs leading-none">
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
        </div>
      </button>
    );
  };

  /* ---------- JSX ---------- */

  return (
    <div className="flex h-dvh flex-col bg-white text-slate-900">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
            onClick={() => setDrawerOpen(true)}
          >
            <Bars3Icon className="h-6 w-6 text-slate-700" />
          </button>
          <button
            type="button"
            className="flex items-center gap-1"
            onClick={() => {
              setPickerOpen((prev) => {
                if (!prev) {
                  requestAnimationFrame(() => {
                    const y = dayjs(visibleMonth + '-01').year();
                    const row = yearScrollRef.current?.querySelector(
                      `[data-year="${y}"]`
                    ) as HTMLElement | null;
                    if (row && yearScrollRef.current) {
                      yearScrollRef.current.scrollTop =
                        row.offsetTop -
                        yearScrollRef.current.offsetHeight / 2 +
                        row.offsetHeight / 2;
                    }
                  });
                }
                return !prev;
              });
            }}
          >
            <span className="text-lg font-semibold tracking-tight text-slate-800">
              {dayjs(visibleMonth + '-01').format('YYYY. M')}
            </span>
            {pickerOpen ? (
              <ChevronUpIcon className="h-4 w-4 stroke-2 text-slate-500" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 stroke-2 text-slate-500" />
            )}
          </button>
        </div>
        <Link
          to="/search"
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
        >
          <MagnifyingGlassIcon className="h-6 w-6 text-slate-700" />
        </Link>
      </header>

      {/* Calendar area */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Year/Month picker overlay */}
        <div
          className={`absolute inset-x-0 top-0 z-30 flex justify-center gap-0 bg-white transition-all duration-300 ${
            pickerOpen
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
                  onClick={() => {
                    const target = dayjs(visibleMonth + '-01').year(y);
                    scrollToMonth(target);
                    setPickerOpen(false);
                  }}
                >
                  {y}년
                </button>
              );
            })}
          </div>
          <div
            ref={monthScrollRef}
            className="flex h-48 w-20 snap-y snap-mandatory flex-col overflow-y-auto overscroll-contain"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
              const isSelected = dayjs(visibleMonth + '-01').month() + 1 === m;
              return (
                <button
                  key={m}
                  type="button"
                  className={`snap-center px-3 py-2 text-center text-sm ${
                    isSelected ? 'font-bold text-slate-900' : 'text-slate-400'
                  }`}
                  onClick={() => {
                    const target = dayjs(visibleMonth + '-01').month(m - 1);
                    scrollToMonth(target);
                    setPickerOpen(false);
                  }}
                >
                  {m}월
                </button>
              );
            })}
          </div>
        </div>

        {/* Picker backdrop */}
        {pickerOpen && (
          <div className="absolute inset-0 z-20" onClick={() => setPickerOpen(false)} />
        )}

        {/* Weekday header */}
        <div className="cal-grid flex-shrink-0 border-b border-slate-100 bg-white">
          {WEEKDAYS.map((wd, i) => (
            <div
              key={wd}
              className={`py-2 text-center text-xs font-semibold ${
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-400'
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Scroll container */}
        <div
          ref={scrollContainerRef}
          className="relative min-h-0 flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          {months.map((m) => {
            const key = m.format('YYYY-MM');
            const cells = getMonthCells(m);
            return (
              <div key={key}>
                {/* Sentinel for IntersectionObserver */}
                <div
                  ref={(el) => {
                    if (el) monthSentinelRefs.current.set(key, el);
                    else monthSentinelRefs.current.delete(key);
                  }}
                  data-month={key}
                  className="h-0"
                />
                {/* Month label */}
                <div className="sticky top-0 z-10 bg-white/90 px-4 py-2 text-sm font-semibold text-slate-500 backdrop-blur-sm">
                  {m.format('YYYY년 M월')}
                </div>
                {/* Calendar grid */}
                <div className="cal-grid">
                  {cells.map((day, i) =>
                    day ? (
                      <DayCell key={day.format('YYYY-MM-DD')} date={day} />
                    ) : (
                      <div key={`empty-${key}-${i}`} className="cal-cell" />
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today button */}
      {visibleMonth !== dayjs().format('YYYY-MM') && (
        <button
          type="button"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-md active:bg-slate-50"
          onClick={() => {
            setVisibleMonth(dayjs().format('YYYY-MM'));
            scrollToMonth(dayjs());
          }}
        >
          &lsaquo; 오늘
        </button>
      )}

      {/* Bottom sheet overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${
          sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSheetOpen(false)}
      />

      {/* Bottom sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-md transform flex-col rounded-t-2xl bg-white shadow-lg transition-transform duration-300 ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '70dvh' }}
      >
        <div
          className="flex-shrink-0 px-5 pt-5 cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => {
            e.stopPropagation();
            const startY = e.touches[0]?.clientY ?? 0;
            const onMove = (ev: TouchEvent) => {
              ev.preventDefault();
              ev.stopPropagation();
              const dy = (ev.touches[0]?.clientY ?? 0) - startY;
              if (dy > 60) {
                setSheetOpen(false);
                document.removeEventListener('touchmove', onMove, true);
                document.removeEventListener('touchend', onEnd, true);
              }
            };
            const onEnd = (ev: TouchEvent) => {
              ev.stopPropagation();
              document.removeEventListener('touchmove', onMove, true);
              document.removeEventListener('touchend', onEnd, true);
            };
            document.addEventListener('touchmove', onMove, { capture: true, passive: false });
            document.addEventListener('touchend', onEnd, true);
          }}
          onClick={() => setSheetOpen(false)}
        >
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
          <div className="mb-4 text-center text-base font-semibold text-slate-800">
            {selectedKey ? dayjs(selectedKey).format('M월 D일 dddd') : '날짜를 선택하세요'}
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
        </div>
        <div className="grid gap-3 overflow-y-auto px-5 pb-5">
          {selectedKey &&
            ((pairEventsByDate[selectedKey] ?? []).length > 0 ||
              (birthdayMap[selectedKey] ?? []).length > 0) && (
              <div className="flex flex-wrap gap-2">
                {(pairEventsByDate[selectedKey] ?? []).map((event) => (
                  <span
                    key={`ev-${event.id}`}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
                  >
                    {event.emoji} {event.title}
                  </span>
                ))}
                {(birthdayMap[selectedKey] ?? []).map((b, i) => (
                  <span
                    key={`bd-${i}`}
                    className="rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700"
                  >
                    {b.emoji} {b.label}
                  </span>
                ))}
              </div>
            )}
          {isPaired && <p className="text-xs font-semibold text-slate-400">나의 기록</p>}
          {(recordsByDate[selectedKey ?? ''] ?? []).length === 0 && (
            <p className="text-center text-xs text-slate-400">기록이 없습니다</p>
          )}
          {(recordsByDate[selectedKey ?? ''] ?? []).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <Button
                variant="ghost"
                className="flex flex-1 items-center gap-2 text-left"
                onClick={() => {
                  setEditingRecordId(record.id);
                  setSelectedCategoryId(record.category.id);
                  setMemoInput(record.memo ?? '');
                }}
                type="button"
              >
                <span className="text-lg">{record.category.emoji}</span>
                <span className="font-medium text-slate-800">{record.category.name}</span>
                {record.memo && <span className="text-slate-500">&middot; {record.memo}</span>}
              </Button>
              <Button
                variant="secondary"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-600"
                onClick={async () => {
                  await deleteDailyRecord(record.id);
                  if (selectedDate) await reloadMonthRecords(selectedDate);
                }}
                type="button"
                aria-label="삭제"
                title="삭제"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {isPaired && selectedKey && (partnerRecordsByDate[selectedKey] ?? []).length > 0 && (
            <>
              <p className="mt-2 text-xs font-semibold text-slate-400">
                {pairInfo?.partnerName ?? '상대방'}의 기록
              </p>
              {(partnerRecordsByDate[selectedKey] ?? []).map((record) => (
                <div
                  key={`p-${record.id}`}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="text-lg">{record.category.emoji}</span>
                  <span className="font-medium text-slate-800">{record.category.name}</span>
                  {record.memo && <span className="text-slate-500">&middot; {record.memo}</span>}
                </div>
              ))}
            </>
          )}
          {/* 과식 단계 선택 */}
          {selectedKey && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">🐷 과식</span>
              <div className="ml-auto flex gap-1">
                {[
                  {
                    level: 'NONE' as OvereatLevel,
                    label: '없음',
                    style: 'border-slate-200 bg-white text-slate-500',
                  },
                  {
                    level: 'MILD' as OvereatLevel,
                    label: '소',
                    style: 'border-green-300 bg-green-100 text-green-700',
                  },
                  {
                    level: 'MODERATE' as OvereatLevel,
                    label: '중',
                    style: 'border-orange-300 bg-orange-200 text-orange-700',
                  },
                  {
                    level: 'SEVERE' as OvereatLevel,
                    label: '대',
                    style: 'border-red-300 bg-red-200 text-red-700',
                  },
                ].map(({ level, label, style }) => {
                  const current = overeatByDate[selectedKey] ?? 'NONE';
                  const isActive = current === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-all ${
                        isActive
                          ? style + ' ring-1 ring-offset-1'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                      onClick={async () => {
                        await updateOvereatLevel(selectedKey, level);
                        if (selectedDate) await reloadMonthRecords(selectedDate);
                      }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {editingRecordId && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                기록 수정
              </p>
            )}
            <div className="grid gap-3">
              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-4 text-center text-sm text-slate-500">
                  선택할 카테고리가 없습니다.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    return (
                      <Button
                        key={category.id}
                        variant={isSelected ? 'secondary' : 'ghost'}
                        className={`rounded-full border px-3 py-2 text-sm font-medium ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                        onClick={() => setSelectedCategoryId(category.id)}
                        type="button"
                      >
                        <span className="mr-1">{category.emoji}</span>
                        {category.name}
                      </Button>
                    );
                  })}
                </div>
              )}
              <Input
                value={memoInput}
                maxLength={20}
                onChange={(event) => setMemoInput(event.target.value)}
                placeholder="메모 (최대 20자)"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              />
              <div className="flex items-center gap-2">
                <Button
                  className="flex-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={async () => {
                    if (!selectedKey || selectedCategoryId == null) return;
                    const payload = {
                      date: selectedKey,
                      categoryId: selectedCategoryId,
                      memo: memoInput.trim() || null,
                    };
                    if (editingRecordId) {
                      await updateDailyRecord(editingRecordId, payload);
                    } else {
                      await createDailyRecord(payload);
                    }
                    setEditingRecordId(null);
                    setSelectedCategoryId(null);
                    setMemoInput('');
                    if (selectedDate) await reloadMonthRecords(selectedDate);
                  }}
                  type="button"
                >
                  저장
                </Button>
                {editingRecordId && (
                  <Button
                    variant="secondary"
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                    onClick={() => {
                      setEditingRecordId(null);
                      setSelectedCategoryId(null);
                      setMemoInput('');
                    }}
                    type="button"
                  >
                    취소
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side drawer overlay */}
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${
          drawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Side drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-white shadow-xl transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-base font-semibold text-slate-800">메뉴</span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
            onClick={() => setDrawerOpen(false)}
          >
            <XMarkIcon className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <nav className="flex flex-col py-2">
          {[
            { to: '/pair', label: '페어', Icon: HeartIcon },
            { to: '/stats', label: '통계', Icon: ChartBarIcon },
            ...(user?.authority === 'ADMIN'
              ? [{ to: '/admin', label: '관리', Icon: WrenchScrewdriverIcon }]
              : []),
            { to: '/me', label: '내정보', Icon: UserCircleIcon },
          ].map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={() => setDrawerOpen(false)}
            >
              <Icon className="h-5 w-5 text-slate-500" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 px-4 py-3">
          <ConfirmDialog
            title="로그아웃"
            description="로그아웃 하시겠어요?"
            confirmLabel="로그아웃"
            cancelLabel="취소"
            onConfirm={logout}
            trigger={
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-lg py-2 text-sm font-medium text-slate-500 hover:text-slate-700"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                로그아웃
              </button>
            }
          />
        </div>
      </div>
    </div>
  );
}
