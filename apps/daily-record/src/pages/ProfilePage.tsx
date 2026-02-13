import React, { useEffect, useState } from 'react';
import { Button, FormField, Input } from '@repo/ui';
import { updateMe, type Gender } from '../api/users';
import { useAuth } from '../auth/AuthContext';
import PageHeader from '../components/PageHeader';

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthDate, setBirthDate] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? '');
    setGender(user?.gender ?? null);
    setBirthDate(user?.birthDate ?? '');
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
        gender: gender,
        birthDate: birthDate || null,
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
    <div className="min-h-screen bg-white text-slate-900">
      <PageHeader title="내 정보" />
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 pb-8">
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
            <FormField label="아이디">
              <Input value={user?.username ?? ''} disabled />
            </FormField>
            <FormField label="이름">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="이름을 입력하세요"
              />
            </FormField>
            <FormField label="성별">
              <div className="flex gap-3">
                {(
                  [
                    ['MALE', '👨 남자'],
                    ['FEMALE', '👩 여자'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                      gender === value
                        ? 'border-blue-300 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                    onClick={() => setGender(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="생년월일">
              <Input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
              />
            </FormField>
            <FormField label="기존 비밀번호">
              <Input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                placeholder="비밀번호 변경 시 필요"
              />
            </FormField>
            <FormField label="새 비밀번호">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </FormField>
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
    </div>
  );
}
