import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { fetchDailyRecords, type DailyRecord } from '../api/dailyRecords';
import { getPairStatus, fetchPartnerDailyRecords } from '../api/pair';
import { PageHeader } from '@repo/auth';
import { Button, FormField, Select } from '@repo/ui';
import CategoryIcon from '../components/CategoryIcon';

type Filter = 'all' | 'together' | 'solo';

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState<number | 'all'>(dayjs().month() + 1);
  const [filter, setFilter] = useState<Filter>('all');
  const [myRecords, setMyRecords] = useState<DailyRecord[]>([]);
  const [partnerRecords, setPartnerRecords] = useState<DailyRecord[]>([]);
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPairStatus()
      .then((res) => {
        if (!cancelled) setIsPaired(res.data?.status === 'CONNECTED');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const target = dayjs(`${year}-${String(month === 'all' ? 1 : month).padStart(2, '0')}-01`);
    const from =
      month === 'all'
        ? target.startOf('year').format('YYYY-MM-DD')
        : target.startOf('month').format('YYYY-MM-DD');
    const to =
      month === 'all'
        ? target.endOf('year').format('YYYY-MM-DD')
        : target.endOf('month').format('YYYY-MM-DD');

    let cancelled = false;
    setLoading(true);

    const promises: [
      Promise<{ data?: DailyRecord[] | null }>,
      Promise<{ data?: DailyRecord[] | null }>,
    ] = [
      fetchDailyRecords({ from, to }),
      isPaired ? fetchPartnerDailyRecords({ from, to }) : Promise.resolve({ data: [] }),
    ];

    Promise.all(promises)
      .then(([myRes, partnerRes]) => {
        if (cancelled) return;
        setMyRecords(myRes.data ?? []);
        setPartnerRecords(partnerRes.data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, month, isPaired]);

  const { stats, total } = useMemo(() => {
    let filtered: DailyRecord[];
    if (filter === 'together') {
      // 같이: 내 together 기록 + 파트너 together 기록 (카테고리 기준 합산)
      const myTogether = myRecords.filter((r) => r.together);
      const partnerTogether = partnerRecords.filter((r) => r.together);
      filtered = [...myTogether, ...partnerTogether];
    } else if (filter === 'solo') {
      filtered = myRecords.filter((r) => !r.together);
    } else {
      // 전체: 내 모든 기록 + 파트너 together 기록
      const partnerTogether = partnerRecords.filter((r) => r.together);
      filtered = [...myRecords, ...partnerTogether];
    }

    const counts = new Map<number, { id: number; name: string; emoji: string; count: number }>();
    filtered.forEach((record) => {
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

    return { stats: withRatio, total: totalCount };
  }, [myRecords, partnerRecords, filter]);

  const periodLabel = useMemo(() => {
    const base = dayjs(`${year}-${String(month === 'all' ? 1 : month).padStart(2, '0')}-01`);
    return month === 'all' ? base.format('YYYY년') : base.format('YYYY년 M월');
  }, [year, month]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <PageHeader title="통계" />
      <div className="mx-auto flex w-full max-w-md flex-col gap-6 px-6 pb-8">
        <div className="text-sm text-slate-500">
          {periodLabel} · 총 {total}건
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <FormField>
              <Select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                {Array.from({ length: dayjs().year() - 2017 + 2 }, (_, idx) => 2018 + idx).map(
                  (value) => (
                    <option key={value} value={value}>
                      {value}년
                    </option>
                  )
                )}
              </Select>
            </FormField>
            <FormField>
              <Select
                value={month}
                onChange={(event) =>
                  setMonth(event.target.value === 'all' ? 'all' : Number(event.target.value))
                }
              >
                <option value="all">전체</option>
                {Array.from({ length: 12 }, (_, idx) => idx + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}월
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {isPaired && (
            <div className="mb-4 flex gap-1">
              {(
                [
                  { value: 'all', label: '전체' },
                  { value: 'together', label: '👫 같이' },
                  { value: 'solo', label: '개인' },
                ] as const
              ).map(({ value, label }) => (
                <Button
                  key={value}
                  variant={filter === value ? 'primary' : 'none'}
                  size="xs"
                  radius="full"
                  type="button"
                  className={
                    filter === value ? '' : 'border border-slate-200 bg-white text-slate-500'
                  }
                  onClick={() => setFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              통계를 불러오는 중입니다...
            </div>
          ) : stats.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              {month === 'all' ? '해당 연도 기록이 없습니다.' : '해당 월 기록이 없습니다.'}
            </div>
          ) : (
            <div className="grid gap-4">
              {stats.map((item) => (
                <div key={item.id} className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <CategoryIcon emoji={item.emoji} className="text-lg" />
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
    </div>
  );
}
