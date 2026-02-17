import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button, FormField, Input } from '@repo/ui';
import { login as loginRequest } from './api/auth';
import { useAuth } from './AuthContext';

type LoginPageProps = {
  redirectTo?: string;
};

export default function LoginPage({ redirectTo = '/' }: LoginPageProps) {
  const navigate = useNavigate();
  const { user, loading, refresh } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) return;
    navigate(redirectTo, { replace: true });
  }, [loading, user, navigate, redirectTo]);

  const loginMutation = useMutation({
    mutationFn: async () => {
      await loginRequest({ username, password });
      const nextUser = await refresh();
      if (!nextUser) {
        throw new Error('no-user');
      }
      return nextUser;
    },
    onSuccess: () => {
      navigate(redirectTo, { replace: true });
    },
    onError: () => {
      setError('로그인에 실패했어요.');
    },
    onMutate: () => {
      setError(null);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    loginMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-white px-6 py-12 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8">
        <header className="text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-slate-400">welcome back</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">로그인</h1>
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
            <FormField label="아이디">
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                required
              />
            </FormField>
            <FormField label="비밀번호">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
              />
            </FormField>
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 rounded-2xl px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loginMutation.isPending ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
