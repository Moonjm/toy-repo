import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DayPicker, type DayButtonProps } from 'react-day-picker';
import dayjs from 'dayjs';
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
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuOpen]);

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
    <div className="min-h-screen bg-slate-50 px-4 pb-28 pt-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-4">
        <main
          className="rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              {user ? `${user.username}님 캘린더` : '캘린더'}
            </div>
            <div ref={menuRef} className="relative flex items-center gap-2">
              {user?.authority === 'ADMIN' && (
                <>
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                    onClick={() => setMenuOpen((prev) => !prev)}
                  >
                    메뉴
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-9 z-10 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                      <a
                        className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        href="/admin/categories"
                        onClick={() => setMenuOpen(false)}
                      >
                        카테고리 관리
                      </a>
                    </div>
                  )}
                </>
              )}
              <button
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                onClick={logout}
              >
                로그아웃
              </button>
            </div>
          </div>
          <DayPicker
            mode="single"
            selected={selectedDate ?? undefined}
            month={month}
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
              month_caption: 'flex items-center justify-between pb-3',
              caption_label: 'text-lg font-semibold tracking-tight text-slate-800',
              nav: 'flex items-center gap-2',
              button_previous:
                'flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100',
              button_next:
                'flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:bg-slate-100',
              chevron: 'h-4 w-4 text-slate-700',
              month_grid: 'w-full table-fixed border-collapse',
              weekdays: 'text-center',
              weekday:
                'py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400',
              weeks: 'table-row-group',
              week: 'table-row',
              day: 'group relative border border-slate-100 p-0 align-top',
              day_button:
                'relative flex h-20 w-full flex-col items-center justify-start gap-1 rounded-none bg-white pt-2 text-sm text-slate-800 transition hover:bg-slate-50 focus:outline-none',
              selected: 'text-blue-600 font-semibold',
              outside: 'text-slate-300',
              today: 'text-blue-600',
            }}
          />
        </main>
      </div>

      <div
        className={`fixed inset-0 bg-black/30 transition-opacity ${
          sheetOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setSheetOpen(false)}
      />

      <div
        className={`fixed inset-x-0 bottom-0 mx-auto w-full max-w-md transform rounded-t-2xl bg-white p-5 shadow-lg transition-transform duration-300 ${
          sheetOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200" />
        <div className="mb-4 text-center text-base font-semibold text-slate-800">
          {selectedKey ? dayjs(selectedKey).format('dddd, MMM D') : 'Pick a day'}
        </div>
        <div className="grid gap-3">
          {(recordsByDate[selectedKey ?? ''] ?? []).map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <button
                className="flex flex-1 items-center gap-2 text-left"
                onClick={() => {
                  setEditingRecordId(record.id);
                  setSelectedCategoryId(record.category.id);
                  setMemoInput(record.memo ?? '');
                }}
              >
                <span className="text-lg">{record.category.emoji}</span>
                <span className="font-medium text-slate-800">{record.category.name}</span>
                {record.memo && <span className="text-slate-500">· {record.memo}</span>}
              </button>
              <button
                className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600"
                onClick={async () => {
                  await deleteDailyRecord(record.id);
                  await loadMonthRecords(month);
                }}
              >
                삭제
              </button>
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
                      <button
                        key={category.id}
                        className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                          isSelected
                            ? 'border-blue-300 bg-blue-50 text-blue-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                        onClick={() => setSelectedCategoryId(category.id)}
                        type="button"
                      >
                        <span className="mr-1">{category.emoji}</span>
                        {category.name}
                      </button>
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
                <button
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
                >
                  저장
                </button>
                {editingRecordId && (
                  <button
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                    onClick={() => {
                      setEditingRecordId(null);
                      setSelectedCategoryId(null);
                      setMemoInput('');
                    }}
                  >
                    취소
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
