import { useCallback, useMemo, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useAuth } from './auth/AuthContext';
import { useCalendarRange } from './hooks/useCalendarRange';
import { useCalendarData } from './hooks/useCalendarData';
import { useCalendarScroll } from './hooks/useCalendarScroll';
import { useBirthdayMap } from './hooks/useBirthdayMap';
import CalendarHeader from './components/Calendar/CalendarHeader';
import YearMonthPicker from './components/Calendar/YearMonthPicker';
import WeekdayHeader from './components/Calendar/WeekdayHeader';
import MonthGrid from './components/Calendar/MonthGrid';
import TodayButton from './components/Calendar/TodayButton';
import RecordSheet from './components/RecordSheet/RecordSheet';
import SheetHeader from './components/RecordSheet/SheetHeader';
import OvereatSelector from './components/RecordSheet/OvereatSelector';
import RecordList from './components/RecordSheet/RecordList';
import RecordForm from './components/RecordSheet/RecordForm';
import SideDrawer from './components/SideDrawer';
import {
  createDailyRecord,
  deleteDailyRecord,
  updateDailyRecord,
  updateOvereatLevel,
  type DailyRecord,
  type OvereatLevel,
} from './api/dailyRecords';
import type { CalendarDataMaps } from './types/calendar';
dayjs.locale('ko');

export default function App() {
  const { user, logout } = useAuth();

  /* ---------- UI state ---------- */
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<string>(() => dayjs().format('YYYY-MM'));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [memoInput, setMemoInput] = useState('');
  const [togetherInput, setTogetherInput] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sheetScrollRef = useRef<HTMLDivElement>(null);

  /* ---------- Custom hooks ---------- */
  const { months, handleScroll, extendRangeIfNeeded } = useCalendarRange(scrollContainerRef);

  const {
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
  } = useCalendarData(months, visibleMonth);

  const birthdayMap = useBirthdayMap(user, pairInfo, isPaired, months);

  const { scrollToMonth, setSentinelRef } = useCalendarScroll({
    months,
    scrollContainerRef,
    loadMonthData,
    setVisibleMonth,
    extendRangeIfNeeded,
  });

  /* ---------- Derived state ---------- */
  const selectedKey = useMemo(
    () => (selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null),
    [selectedDate]
  );

  const dataMaps = useMemo<CalendarDataMaps>(
    () => ({
      recordsByDate,
      partnerRecordsByDate,
      pairEventsByDate,
      overeatByDate,
      holidayMap,
      birthdayMap,
    }),
    [recordsByDate, partnerRecordsByDate, pairEventsByDate, overeatByDate, holidayMap, birthdayMap]
  );

  /* ---------- Callbacks ---------- */
  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setEditingRecordId(null);
    setSelectedCategoryId(null);
    setMemoInput('');
    setTogetherInput(false);
    sheetScrollRef.current?.scrollTo(0, 0);
    setSheetOpen(true);
  }, []);

  const handleEditRecord = useCallback((record: DailyRecord) => {
    setEditingRecordId(record.id);
    setSelectedCategoryId(record.category.id);
    setMemoInput(record.memo ?? '');
    setTogetherInput(record.together);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (recordId: number) => deleteDailyRecord(recordId),
    onSuccess: () => {
      if (selectedDate) reloadMonthRecords(selectedDate);
    },
  });

  const overeatMutation = useMutation({
    mutationFn: ({ date, level }: { date: string; level: OvereatLevel }) =>
      updateOvereatLevel(date, level),
    onSuccess: () => {
      if (selectedDate) reloadMonthRecords(selectedDate);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      date: string;
      categoryId: number;
      memo: string | null;
      together: boolean;
      editingId: number | null;
    }) => {
      const { editingId, ...req } = payload;
      if (editingId) {
        await updateDailyRecord(editingId, req);
      } else {
        await createDailyRecord(req);
      }
    },
    onSuccess: () => {
      setEditingRecordId(null);
      setSelectedCategoryId(null);
      setMemoInput('');
      setTogetherInput(false);
      if (selectedDate) reloadMonthRecords(selectedDate);
    },
  });

  const busy = saveMutation.isPending || deleteMutation.isPending || overeatMutation.isPending;

  const handleDeleteRecord = useCallback(
    (recordId: number) => {
      if (busy) return;
      deleteMutation.mutate(recordId);
    },
    [busy, deleteMutation]
  );

  const handleOvereatSelect = useCallback(
    (level: OvereatLevel) => {
      if (!selectedKey || busy) return;
      overeatMutation.mutate({ date: selectedKey, level });
    },
    [selectedKey, busy, overeatMutation]
  );

  const handleSave = useCallback(() => {
    if (!selectedKey || selectedCategoryId == null || busy) return;
    saveMutation.mutate({
      date: selectedKey,
      categoryId: selectedCategoryId,
      memo: memoInput.trim() || null,
      together: togetherInput,
      editingId: editingRecordId,
    });
  }, [
    selectedKey,
    selectedCategoryId,
    memoInput,
    togetherInput,
    editingRecordId,
    busy,
    saveMutation,
  ]);

  const handleCancelEdit = useCallback(() => {
    setEditingRecordId(null);
    setSelectedCategoryId(null);
    setMemoInput('');
    setTogetherInput(false);
  }, []);

  const handleGoToday = useCallback(() => {
    setVisibleMonth(dayjs().format('YYYY-MM'));
    scrollToMonth(dayjs());
  }, [scrollToMonth]);

  /* ---------- Render ---------- */
  return (
    <div className="flex h-dvh flex-col bg-white text-slate-900">
      <CalendarHeader
        visibleMonth={visibleMonth}
        pickerOpen={pickerOpen}
        onTogglePicker={() => setPickerOpen((prev) => !prev)}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <YearMonthPicker
          open={pickerOpen}
          visibleMonth={visibleMonth}
          onClose={() => setPickerOpen(false)}
          onSelectMonth={(target) => {
            scrollToMonth(target);
            setPickerOpen(false);
          }}
        />

        <WeekdayHeader />

        <div
          ref={scrollContainerRef}
          className="relative min-h-0 flex-1 overflow-y-auto"
          onScroll={handleScroll}
        >
          <MonthGrid
            months={months}
            data={dataMaps}
            isPaired={isPaired}
            onSelectDate={handleSelectDate}
            setSentinelRef={setSentinelRef}
          />
        </div>
      </div>

      <TodayButton visibleMonth={visibleMonth} onGoToday={handleGoToday} />

      <RecordSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        sheetScrollRef={sheetScrollRef}
        header={
          <SheetHeader
            selectedKey={selectedKey}
            pairEventsByDate={pairEventsByDate}
            birthdayMap={birthdayMap}
            holidayMap={holidayMap}
          />
        }
      >
        {selectedKey && (
          <OvereatSelector
            currentLevel={overeatByDate[selectedKey] ?? 'NONE'}
            onSelect={handleOvereatSelect}
            disabled={busy}
          />
        )}
        <RecordList
          myRecords={recordsByDate[selectedKey ?? ''] ?? []}
          partnerRecords={partnerRecordsByDate[selectedKey ?? ''] ?? []}
          isPaired={isPaired}
          partnerName={pairInfo?.partnerName ?? '상대방'}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
          busy={busy}
        />
        <RecordForm
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          memoInput={memoInput}
          onMemoChange={setMemoInput}
          togetherInput={togetherInput}
          onToggleTogether={() => setTogetherInput((v) => !v)}
          editingRecordId={editingRecordId}
          onSave={handleSave}
          onCancelEdit={handleCancelEdit}
          busy={busy}
        />
      </RecordSheet>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAdmin={user?.authority === 'ADMIN'}
        onLogout={logout}
      />
    </div>
  );
}
