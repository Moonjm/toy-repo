import React, { useEffect, useMemo, useRef, useState } from 'react';
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
} from '@heroicons/react/24/outline';
import { useAuth } from './auth/AuthContext';
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const monthScrollRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

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
    const isToday = modifiers.today;

    let dateClass = 'text-slate-800';
    if (holidayNames || isSunday) dateClass = 'text-red-500';
    else if (isSaturday) dateClass = 'text-blue-500';

    return (
      <button {...buttonProps} title={holidayNames?.join(', ') || undefined}>
        <div className="flex h-full w-full flex-col items-center gap-0.5 overflow-hidden pt-1.5">
          {isToday ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-[13px] font-bold text-white">
              {children}
            </span>
          ) : (
            <span className={`text-[13px] font-medium ${dateClass}`}>{children}</span>
          )}
          {holidayNames && (
            <div className="flex w-full flex-col items-center gap-px px-0.5">
              {holidayNames.slice(0, 2).map((name) => (
                <span
                  key={name}
                  className="w-full truncate rounded-sm bg-red-50 px-0.5 text-center text-[9px] leading-tight text-red-500"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
          {items.length > 0 && (
            <div className="flex flex-wrap justify-center gap-0.5">
              {Array.from(new Set(items.map((item) => item.category.id)))
                .slice(0, 3)
                .map((categoryId) => {
                  const category = categories.find((c) => c.id === categoryId);
                  return (
                    <span key={`${key}-${categoryId}`} className="text-xs leading-none">
                      {category?.emoji ?? '?'}
                    </span>
                  );
                })}
              {items.length > 3 && (
                <span className="text-[9px] text-slate-400">+{items.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </button>
    );
  };

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
                    const y = dayjs(month).year();
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
              {dayjs(month).format('YYYY. M')}
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

      {/* Calendar grid */}
      <div
        className="calendar-full relative flex min-h-0 flex-1 flex-col overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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
                const isSelected = dayjs(month).year() === y;
                return (
                  <button
                    key={y}
                    data-year={y}
                    type="button"
                    className={`snap-center px-3 py-2 text-center text-sm ${
                      isSelected ? 'font-bold text-slate-900' : 'text-slate-400'
                    }`}
                    onClick={() => {
                      setMonth(dayjs(month).year(y).toDate());
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
                const isSelected = dayjs(month).month() + 1 === m;
                return (
                  <button
                    key={m}
                    type="button"
                    className={`snap-center px-3 py-2 text-center text-sm ${
                      isSelected ? 'font-bold text-slate-900' : 'text-slate-400'
                    }`}
                    onClick={() => {
                      setMonth(
                        dayjs(month)
                          .month(m - 1)
                          .toDate()
                      );
                    }}
                  >
                    {m}월
                  </button>
                );
              })}
            </div>
          </div>

        {/* Picker backdrop – closes picker on tap */}
        {pickerOpen && (
          <div
            className="absolute inset-0 z-20"
            onClick={() => setPickerOpen(false)}
          />
        )}

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
          formatters={{
            formatWeekdayName: (date) =>
              ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0'][date.getDay()],
          }}
          classNames={{
            root: 'flex-1 flex flex-col min-h-0',
            months: 'flex-1 flex flex-col min-h-0',
            month: 'flex-1 flex flex-col min-h-0',
            month_caption: 'hidden',
            nav: 'hidden',
            caption_label: 'hidden',
            button_previous: 'hidden',
            button_next: 'hidden',
            chevron: 'hidden',
            month_grid: 'flex-1',
            weekdays: '',
            weekday: 'py-2 text-center text-xs font-semibold text-slate-400',
            weeks: '',
            week: '',
            day: 'p-0 align-top',
            day_button: 'w-full bg-transparent focus:outline-none',
            selected: '',
            outside: 'opacity-30',
            today: '',
          }}
        />
      </div>

      {/* Today button */}
      {!dayjs(month).isSame(dayjs(), 'month') && (
        <button
          type="button"
          className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 shadow-md active:bg-slate-50"
          onClick={() => {
            const today = new Date();
            setMonth(today);
            setSelectedDate(today);
            setEditingRecordId(null);
            setSelectedCategoryId(null);
            setMemoInput('');
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
                {record.memo && <span className="text-slate-500">&middot; {record.memo}</span>}
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
                maxLength={10}
                onChange={(event) => setMemoInput(event.target.value)}
                placeholder="메모 (최대 10자)"
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
