import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, IconButton, ConfirmDialog, Input } from '@repo/ui';
import { TrashIcon } from '@heroicons/react/24/outline';
import { createPairEvent, deletePairEvent, fetchPairEvents } from '../api/pairEvents';
import { PageHeader } from '@repo/auth';
import { queryKeys } from '../queryKeys';

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function PairEventsPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [recurring, setRecurring] = useState(true);

  const { data: events = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.pairEvents.list(),
    queryFn: () => fetchPairEvents().then((res) => res.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createPairEvent({
        title: title.trim(),
        emoji: emoji.trim(),
        eventDate,
        recurring,
      }),
    onSuccess: () => {
      setTitle('');
      setEmoji('');
      setEventDate('');
      setRecurring(true);
      setNotice('기념일이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: queryKeys.pairEvents.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deletePairEvent(id),
    onSuccess: () => {
      setNotice('기념일이 삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: queryKeys.pairEvents.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const handleCreate = () => {
    if (!title.trim() || !emoji.trim() || !eventDate) {
      setError('모든 항목을 입력해주세요.');
      return;
    }
    setError(null);
    setNotice(null);
    createMutation.mutate();
  };

  const handleDelete = (id: number) => {
    if (deleteMutation.isPending) return;
    setError(null);
    setNotice(null);
    deleteMutation.mutate(id);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHeader title="기념일 관리" backTo="/pair" />
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 pb-8">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        )}

        <div className="rounded-3xl bg-white/95 p-6 shadow-[var(--shadow)] backdrop-blur">
          <h3 className="mb-4 text-sm font-semibold text-slate-500">새 기념일 등록</h3>
          <div className="grid gap-3">
            <div className="flex gap-2">
              <Input
                value={emoji}
                maxLength={4}
                onChange={(event) => setEmoji(event.target.value)}
                placeholder="💍"
                className="w-14 shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-lg"
              />
              <Input
                value={title}
                maxLength={30}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="기념일 이름"
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
              />
            </div>
            <Input
              type="date"
              value={eventDate}
              onChange={(event) => setEventDate(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300"
              />
              매년 반복
            </label>
            <Button
              variant="primary"
              size="md"
              onClick={handleCreate}
              disabled={createMutation.isPending}
              type="button"
            >
              {createMutation.isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </div>

        <div className="rounded-3xl bg-white/95 p-6 shadow-[var(--shadow)] backdrop-blur">
          <h3 className="mb-4 text-sm font-semibold text-slate-500">등록된 기념일</h3>
          {loading ? (
            <p className="text-center text-sm text-slate-400">불러오는 중...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-sm text-slate-400">등록된 기념일이 없습니다</p>
          ) : (
            <div className="grid gap-2">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{event.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{event.title}</p>
                      <p className="text-xs text-slate-400">
                        {event.eventDate}
                        {event.recurring && ' · 매년'}
                      </p>
                    </div>
                  </div>
                  <ConfirmDialog
                    title="기념일 삭제"
                    description={`"${event.title}" 기념일을 삭제하시겠어요?`}
                    confirmLabel="삭제"
                    cancelLabel="취소"
                    onConfirm={() => handleDelete(event.id)}
                    trigger={
                      <IconButton
                        variant="secondary"
                        size="sm"
                        disabled={deleteMutation.isPending && deleteMutation.variables === event.id}
                        type="button"
                        aria-label="삭제"
                        className="border border-red-200 text-red-600"
                      >
                        <TrashIcon />
                      </IconButton>
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
