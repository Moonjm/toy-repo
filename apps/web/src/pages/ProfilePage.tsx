import React, { useEffect, useState } from 'react';
import { Button, ConfirmDialog } from '@repo/ui';
import { PowerIcon } from '@heroicons/react/24/outline';
import { updateMe } from '../api/users';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import BottomTabs from '../components/BottomTabs';

function formatError(error: unknown): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const message = (error.body as { message?: string }).message;
    if (message) return message;
  }
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function ProfilePage() {
  const { user, refresh, logout } = useAuth();
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const nextName = name.trim();
    const nextPassword = password.trim();
    const nextCurrent = currentPassword.trim();

    if (nextPassword && !nextCurrent) {
      setError('비밀번호를 변경하려면 기존 비밀번호를 입력하세요.');
      return;
    }

    setBusy(true);
    try {
      await updateMe({
        name: nextName.length > 0 ? nextName : null,
        currentPassword: nextPassword ? nextCurrent : null,
        password: nextPassword || null,
      });
      await refresh();
      setNotice('내 정보가 업데이트됐어요.');
      setCurrentPassword('');
      setPassword('');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 pb-28 pt-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">profile</p>
            <h1
              className="mt-1 text-3xl font-semibold tracking-tight text-slate-900"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              내 정보 수정
            </h1>
          </div>
          <div className="relative flex items-center gap-2">
            <ConfirmDialog
              title="로그아웃"
              description="로그아웃 하시겠어요?"
              confirmLabel="로그아웃"
              cancelLabel="취소"
              onConfirm={logout}
              trigger={
                <Button
                  variant="secondary"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 p-0 text-slate-600 !rounded-full"
                  aria-label="로그아웃"
                  title="로그아웃"
                  type="button"
                >
                  <PowerIcon className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </header>

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

        <form
          className="rounded-3xl bg-white/95 p-8 shadow-[var(--shadow)] backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              아이디
              <input
                value={user?.username ?? ''}
                disabled
                className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-base text-slate-500"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              이름
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력하세요"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              기존 비밀번호
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="비밀번호 변경 시 필요"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              새 비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-pink-400 focus:outline-none"
              />
            </label>
            <Button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-2xl px-4 py-3 text-sm font-semibold disabled:opacity-70"
            >
              {busy ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </div>
      <BottomTabs />
    </div>
  );
}
