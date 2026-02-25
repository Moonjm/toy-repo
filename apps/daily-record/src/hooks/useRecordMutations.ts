import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  createDailyRecord,
  deleteDailyRecord,
  updateDailyRecord,
  updateOvereatLevel,
  type OvereatLevel,
} from '../api/dailyRecords';

interface UseRecordMutationsParams {
  selectedKey: string | null;
  selectedDate: Date | null;
  reloadMonthRecords: (date: Date) => void;
  editingRecordId: number | null;
  selectedCategoryId: number | null;
  memoInput: string;
  togetherInput: boolean;
  setEditingRecordId: (id: number | null) => void;
  setSelectedCategoryId: (id: number | null) => void;
  setMemoInput: (memo: string) => void;
  setTogetherInput: (together: boolean) => void;
}

export function useRecordMutations({
  selectedKey,
  selectedDate,
  reloadMonthRecords,
  editingRecordId,
  selectedCategoryId,
  memoInput,
  togetherInput,
  setEditingRecordId,
  setSelectedCategoryId,
  setMemoInput,
  setTogetherInput,
}: UseRecordMutationsParams) {
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
  }, [setEditingRecordId, setSelectedCategoryId, setMemoInput, setTogetherInput]);

  return { busy, handleDeleteRecord, handleOvereatSelect, handleSave, handleCancelEdit };
}
