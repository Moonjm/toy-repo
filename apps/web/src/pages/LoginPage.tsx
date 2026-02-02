import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest } from '../api/auth';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading, refresh } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    navigate('/calendar', { replace: true });
  }, [loading, user, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await loginRequest({ username, password });
      const nextUser = await refresh();
      if (!nextUser) {
        throw new Error('no-user');
      }
      navigate('/calendar', { replace: true });
    } catch (err) {
      setError('로그인에 실패했어요.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#cffafe,_#f8fafc_45%,_#fff7ed_100%)] px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-400">welcome back</p>
          <h1
            className="mt-3 text-4xl font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            로그인
          </h1>
          <p className="mt-2 text-sm text-slate-500">권한에 따라 화면이 자동으로 이동합니다.</p>
        </header>

        <form
          className="rounded-3xl bg-white/95 p-8 shadow-[var(--shadow)] backdrop-blur"
          onSubmit={handleSubmit}
        >
          {error && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              아이디
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-sky-400 focus:outline-none"
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              비밀번호
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-sky-400 focus:outline-none"
                required
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? '로그인 중...' : '로그인'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
