import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { fetchDailyRecords } from '../api/dailyRecords';
import BottomTabs from '../components/BottomTabs';
import { Button } from '@repo/ui';

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'year'>('month');
  const [stats, setStats] = useState<
    { id: number; name: string; emoji: string; count: number; ratio: number }[]
  >([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const now = dayjs();
    const from =
      viewMode === 'year'
        ? now.startOf('year').format('YYYY-MM-DD')
        : now.startOf('month').format('YYYY-MM-DD');
    const to =
      viewMode === 'year'
        ? now.endOf('year').format('YYYY-MM-DD')
        : now.endOf('month').format('YYYY-MM-DD');

    let cancelled = false;
    setLoading(true);
    fetchDailyRecords({ from, to })
      .then((res) => {
        if (cancelled) return;
        const counts = new Map<
          number,
          { id: number; name: string; emoji: string; count: number }
        >();
        (res.data ?? []).forEach((record) => {
          const category = record.category;
          const existing = counts.get(category.id);
          if (existing) {
            existing.count += 1;
          } else {
            counts.set(category.id, {
              id: category.id,
              name: category.name,
              emoji: category.emoji,
              count: 1,
            });
          }
        });

        const list = Array.from(counts.values()).sort((a, b) => b.count - a.count);
        const totalCount = list.reduce((sum, item) => sum + item.count, 0);
        const withRatio = list.map((item) => ({
          ...item,
          ratio: totalCount === 0 ? 0 : Math.round((item.count / totalCount) * 100),
        }));

        setStats(withRatio);
        setTotal(totalCount);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [viewMode]);

  const periodLabel = useMemo(() => {
    const now = dayjs();
    return viewMode === 'year' ? now.format('YYYY년') : now.format('YYYY년 M월');
  }, [viewMode]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 pb-28 pt-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">stats</p>
            <h1
              className="mt-1 text-3xl font-semibold tracking-tight text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              월간 통계
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {periodLabel} · 총 {total}건
            </p>
          </div>
          <div />
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="mb-4 flex items-center gap-2">
            {(['month', 'year'] as const).map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'primary' : 'ghost'}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  viewMode === mode ? '' : 'text-slate-600'
                }`}
                type="button"
                onClick={() => setViewMode(mode)}
              >
                {mode === 'month' ? '이번 달' : '올해'}
              </Button>
            ))}
          </div>
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              통계를 불러오는 중입니다...
            </div>
          ) : stats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              이번 달 기록이 없습니다.
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.map((item) => (
                <div key={item.id} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.emoji}</span>
                      <span className="font-semibold text-slate-800">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {item.count}회 · {item.ratio}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900"
                      style={{ width: `${item.ratio}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <BottomTabs />
    </div>
  );
}
