import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@repo/ui';
import { Bars3Icon, TrashIcon } from '@heroicons/react/24/outline';
import BottomTabs from './components/BottomTabs';
import { DayPicker, type DayButtonProps } from 'react-day-picker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { fetchHolidays } from './api/holidays';
import { fetchCategories, type Category } from './api/categories';
import {
  createDailyRecord,
  deleteDailyRecord,
  fetchDailyRecords,
  type DailyRecord,
  updateDailyRecord,
} from './api/dailyRecords';
import { useAuth } from './auth/AuthContext';

dayjs.locale('ko');

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date>(new Date());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [recordsByDate, setRecordsByDate] = useState<Record<string, DailyRecord[]>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [holidayMap, setHolidayMap] = useState<Record<string, string[]>>({});
  const holidayCacheRef = useRef<Record<string, boolean>>({});
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [memoInput, setMemoInput] = useState('');
  const { user } = useAuth();

  const selectedKey = useMemo(
    () => (selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null),
    [selectedDate]
  );

  const goPrevMonth = () => {
    setMonth((current) => dayjs(current).subtract(1, 'month').toDate());
  };

  const goNextMonth = () => {
    setMonth((current) => dayjs(current).add(1, 'month').toDate());
  };

  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeAxis = useRef<'x' | 'y' | null>(null);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    swipeAxis.current = null;
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    if (!start) return;
    const touch = event.touches[0];
    if (!touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (!swipeAxis.current) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;
      swipeAxis.current = Math.abs(deltaX) > Math.abs(deltaY) ? 'x' : 'y';
    }
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    const axis = swipeAxis.current;
    touchStart.current = null;
    swipeAxis.current = null;
    if (!start || axis !== 'x') return;
    const endX = event.changedTouches[0]?.clientX ?? start.x;
    const deltaX = endX - start.x;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX > 0) {
      goPrevMonth();
    } else {
      goNextMonth();
    }
  };

  const loadMonthRecords = (targetMonth: Date) => {
    const from = dayjs(targetMonth).startOf('month').format('YYYY-MM-DD');
    const to = dayjs(targetMonth).endOf('month').format('YYYY-MM-DD');
    return fetchDailyRecords({ from, to })
      .then((res) => {
        const next: Record<string, DailyRecord[]> = {};
        (res.data ?? []).forEach((record) => {
          const key = dayjs(record.date).format('YYYY-MM-DD');
          if (!next[key]) next[key] = [];
          next[key].push(record);
        });
        setRecordsByDate(next);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const year = String(dayjs(month).year());
    if (holidayCacheRef.current[year]) return;

    let cancelled = false;
    fetchHolidays(year)
      .then((res) => {
        if (cancelled || !Array.isArray(res?.data)) return;
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

    return () => {
      cancelled = true;
    };
  }, [month]);

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
    loadMonthRecords(month);
  }, [month]);

  const DayButton = (props: DayButtonProps) => {
    const { day, modifiers, children, ...buttonProps } = props;
    const key = dayjs(day.date).format('YYYY-MM-DD');
    const items = recordsByDate[key] || [];
    const holidayNames = holidayMap[key];
    const weekday = dayjs(day.date).day();
    const isSunday = weekday === 0;
    const isSaturday = weekday === 6;
    const dateTextClass = holidayNames
      ? 'text-red-500 font-semibold'
      : modifiers.today
        ? 'text-emerald-600 font-semibold'
        : isSunday
          ? 'text-red-500'
          : isSaturday
            ? 'text-blue-500'
            : 'text-slate-800';

    return (
      <button {...buttonProps} title={holidayNames?.join(', ') || undefined}>
        <div className="flex h-20 w-full flex-col items-center justify-start gap-1 pt-2 text-sm">
          <div className={`font-medium ${dateTextClass}`}>{children}</div>
          <div className="flex min-h-5 items-center gap-1 text-base" aria-hidden="true">
            {Array.from(new Set(items.map((item) => item.category.id)))
              .slice(0, 3)
              .map((categoryId) => {
                const category = categories.find((typeItem) => typeItem.id === categoryId);
                return <span key={`${key}-${categoryId}`}>{category?.emoji ?? '❓'}</span>;
              })}
            {items.length > 3 && (
              <span className="text-xs text-slate-400">+{items.length - 3}</span>
            )}
          </div>
          <div className="flex min-h-3 items-center">
            {holidayNames && <span className="h-1.5 w-1.5 rounded-full bg-red-500" />}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-28 pt-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <main
          className="touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mb-3 flex items-center justify-between px-4">
            <div className="text-xs font-semibold text-slate-500">
              {user ? `${user.name ?? user.username}님 캘린더` : '캘린더'}
            </div>
            <div />
          </div>
          <div className="mb-3 grid grid-cols-[96px_1fr_96px] items-center px-4">
            <button
              className="justify-self-start flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100"
              onClick={goPrevMonth}
              type="button"
              aria-label="이전 달"
              title="이전 달"
            >
              <span className="text-lg leading-none">‹</span>
            </button>
            <div className="text-center text-lg font-semibold tracking-tight text-slate-800">
              {dayjs(month).format('YYYY년 M월')}
            </div>
            <div className="flex items-center justify-end gap-2">
              <div className="min-w-[52px]">
                <button
                  className={`rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm hover:bg-slate-50 ${
                    dayjs(month).isSame(dayjs(), 'month') ? 'invisible' : ''
                  }`}
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    setMonth(today);
                    setSelectedDate(today);
                    setEditingRecordId(null);
                    setSelectedCategoryId(null);
                    setMemoInput('');
                  }}
                >
                  오늘
                </button>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100"
                onClick={goNextMonth}
                type="button"
                aria-label="다음 달"
                title="다음 달"
              >
                <span className="text-lg leading-none">›</span>
              </button>
            </div>
          </div>
          <div style={{ '--rdp-outside-opacity': 0.35 } as React.CSSProperties}>
            <DayPicker
              mode="single"
              selected={selectedDate ?? undefined}
              month={month}
              hideNavigation
              showOutsideDays
              onMonthChange={setMonth}
              onDayClick={(day) => {
                setSelectedDate(day);
                setEditingRecordId(null);
                setSelectedCategoryId(null);
                setMemoInput('');
                setSheetOpen(true);
              }}
              components={{ DayButton }}
              classNames={{
                root: 'w-full',
                months: 'w-full',
                month: 'w-full',
                month_caption: 'hidden',
                nav: 'hidden',
                caption_label: 'hidden',
                button_previous: 'hidden',
                button_next: 'hidden',
                chevron: 'hidden',
                month_grid: 'w-full table-fixed border-collapse',
                weekdays: 'text-center',
                weekday:
                  'py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400',
                weeks: 'table-row-group',
                week: 'table-row',
                day: 'group relative border border-slate-100 p-0 align-top',
                day_button:
                  'relative flex h-20 w-full flex-col items-center justify-start gap-1 rounded-none bg-white pt-2 text-sm text-slate-600 transition hover:bg-slate-50 focus:outline-none',
                selected: 'text-blue-600 font-semibold',
                outside: 'opacity-40',
                today: 'text-blue-600',
              }}
            />
          </div>
        </main>
      </div>

      <div
        className={`fixed inset-0 bg-black/30 transition-opacity ${
          sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSheetOpen(false)}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-md transform rounded-t-2xl bg-white p-5 shadow-lg transition-transform duration-300 ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
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
        <div className="grid gap-3">
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
                {record.memo && <span className="text-slate-500">· {record.memo}</span>}
              </Button>
              <Button
                variant="secondary"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-600"
                onClick={async () => {
                  await deleteDailyRecord(record.id);
                  await loadMonthRecords(month);
                }}
                type="button"
                aria-label="삭제"
                title="삭제"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {editingRecordId ? '기록 수정' : '기록 추가'}
            </p>
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
              <input
                value={memoInput}
                maxLength={10}
                onChange={(event) => setMemoInput(event.target.value)}
                placeholder="메모 (최대 10자)"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
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
                    await loadMonthRecords(month);
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
      <BottomTabs />
    </div>
  );
}
