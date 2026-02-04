import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import BottomTabs from '../components/BottomTabs';
import { FormField, Input, Select } from '@repo/ui';
import { fetchDailyRecords, type DailyRecord } from '../api/dailyRecords';
import { fetchCategories, type Category } from '../api/categories';

export default function SearchPage() {
  const now = dayjs();
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState<number | 'all'>('all');
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories()
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
    const start =
      month === 'all'
        ? dayjs(`${year}-01-01`).startOf('year')
        : dayjs(`${year}-${String(month).padStart(2, '0')}-01`).startOf('month');
    const end =
      month === 'all'
        ? dayjs(`${year}-12-31`).endOf('year')
        : dayjs(`${year}-${String(month).padStart(2, '0')}-01`).endOf('month');
    const from = start.format('YYYY-MM-DD');
    const to = end.format('YYYY-MM-DD');

    let cancelled = false;
    setLoading(true);
    fetchDailyRecords({ from, to })
      .then((res) => {
        if (cancelled) return;
        setRecords(res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setRecords([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const filtered = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return records
      .filter((record) => {
        if (categoryId === 'all') return true;
        return record.category.id === categoryId;
      })
      .filter((record) => {
        if (!normalizedKeyword) return true;
        return (record.memo ?? '').toLowerCase().includes(normalizedKeyword);
      })
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [records, categoryId, keyword]);

  return (
    <div className="min-h-screen bg-white px-6 pb-28 pt-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <section className="sticky top-0 z-20 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <FormField>
              <Select value={year} onChange={(event) => setYear(Number(event.target.value))}>
                {Array.from({ length: now.year() - 2017 + 2 }, (_, idx) => 2018 + idx).map(
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
          <div className="mt-3 grid grid-cols-2 gap-3">
            <FormField>
              <Select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value === 'all' ? 'all' : Number(event.target.value))
                }
              >
                <option value="all">전체</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.emoji} {category.name}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField>
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="예: 운동, 회식"
              />
            </FormField>
          </div>
        </section>

        <section className="grid gap-3">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              기록을 불러오는 중입니다...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
              검색 결과가 없습니다.
            </div>
          ) : (
            filtered.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-400">
                    {dayjs(record.date).format('M월 D일 dddd')}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <span className="text-lg">{record.category.emoji}</span>
                    {record.category.name}
                  </div>
                  {record.memo && <div className="mt-1 text-xs text-slate-500">{record.memo}</div>}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
      <BottomTabs />
    </div>
  );
}
