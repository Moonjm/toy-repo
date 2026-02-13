import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, ConfirmDialog, Input } from '@repo/ui';
import { ClipboardDocumentIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { acceptInvite, createInvite, getPairStatus, unpair, type PairResponse } from '../api/pair';
import PageHeader from '../components/PageHeader';

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function PairPage() {
  const [pair, setPair] = useState<PairResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await getPairStatus();
      const data = res.data ?? null;
      setPair(data);
      if (data?.status === 'PENDING') {
        const inviteRes = await createInvite();
        setInviteCode(inviteRes.data.inviteCode);
      } else {
        setInviteCode(null);
      }
    } catch {
      setPair(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleCreateInvite = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      const res = await createInvite();
      setInviteCode(res.data.inviteCode);
      await loadStatus();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleAcceptInvite = async () => {
    const code = inputCode.trim().toUpperCase();
    if (code.length !== 6) {
      setError('초대 코드는 6자리입니다.');
      return;
    }
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await acceptInvite(code);
      setNotice('페어가 연결되었습니다!');
      setInputCode('');
      setInviteCode(null);
      await loadStatus();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleUnpair = async () => {
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      await unpair();
      setPair(null);
      setInviteCode(null);
      setNotice('페어가 해제되었습니다.');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = (code: string) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => setNotice('초대 코드가 복사되었습니다.'));
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setNotice('초대 코드가 복사되었습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <PageHeader title="페어" />
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 px-6 py-12">
          <p className="text-sm text-slate-500">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHeader title="페어" />
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

        {pair?.status === 'CONNECTED' ? (
          <div className="rounded-3xl bg-white/95 p-8 shadow-[var(--shadow)] backdrop-blur">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">💑</div>
              <h2 className="text-lg font-bold text-slate-900">페어 연결됨</h2>
              <p className="mt-1 text-sm text-slate-500">
                {pair.partnerName ?? '상대방'}님과 연결되어 있습니다
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">상대방</span>
                <span className="font-semibold text-slate-800">{pair.partnerName ?? '-'}</span>
              </div>
              {pair.connectedAt && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500">연결일</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(pair.connectedAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              )}
            </div>
            <Link
              to="/pair/events"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <CalendarDaysIcon className="h-4 w-4" />
              기념일 관리
            </Link>
            <div className="mt-4">
              <ConfirmDialog
                title="페어 해제"
                description="정말로 페어를 해제하시겠어요? 상대방의 기록을 더 이상 볼 수 없습니다."
                confirmLabel="해제"
                cancelLabel="취소"
                onConfirm={handleUnpair}
                trigger={
                  <Button
                    variant="secondary"
                    className="w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600"
                    disabled={busy}
                    type="button"
                  >
                    페어 해제
                  </Button>
                }
              />
            </div>
          </div>
        ) : pair?.status === 'PENDING' && inviteCode ? (
          <div className="rounded-3xl bg-white/95 p-8 shadow-[var(--shadow)] backdrop-blur">
            <div className="mb-6 text-center">
              <div className="mb-2 text-4xl">⏳</div>
              <h2 className="text-lg font-bold text-slate-900">초대 대기 중</h2>
              <p className="mt-1 text-sm text-slate-500">상대방에게 아래 코드를 공유하세요</p>
            </div>
            <div className="mx-auto mb-4 rounded-xl border border-slate-200 bg-slate-50 px-6 py-4 text-center">
              <span className="text-2xl font-bold tracking-[0.3em] text-slate-900">
                {inviteCode}
              </span>
            </div>
            <Button
              variant="secondary"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              onClick={() => handleCopy(inviteCode)}
              type="button"
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
              코드 복사
            </Button>
            <div className="mt-4">
              <ConfirmDialog
                title="초대 취소"
                description="초대를 취소하시겠어요?"
                confirmLabel="취소하기"
                cancelLabel="돌아가기"
                onConfirm={handleUnpair}
                trigger={
                  <Button
                    variant="secondary"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600"
                    disabled={busy}
                    type="button"
                  >
                    초대 취소
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-3xl bg-white/95 p-8 shadow-[var(--shadow)] backdrop-blur">
              <div className="mb-6 text-center">
                <div className="mb-2 text-4xl">🔗</div>
                <h2 className="text-lg font-bold text-slate-900">페어 연결</h2>
                <p className="mt-1 text-sm text-slate-500">
                  상대방과 캘린더를 공유하여 서로의 기록을 확인하세요
                </p>
              </div>
              <Button
                className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                onClick={handleCreateInvite}
                disabled={busy}
                type="button"
              >
                {busy ? '생성 중...' : '초대 코드 생성'}
              </Button>
            </div>

            <div className="rounded-3xl bg-white/95 p-8 shadow-[var(--shadow)] backdrop-blur">
              <h3 className="mb-4 text-center text-sm font-semibold text-slate-500">
                초대 코드가 있다면
              </h3>
              <div className="flex gap-2">
                <Input
                  value={inputCode}
                  maxLength={6}
                  onChange={(event) => setInputCode(event.target.value.toUpperCase())}
                  placeholder="6자리 코드 입력"
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-lg font-bold tracking-[0.2em] text-slate-800 uppercase"
                />
                <Button
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                  onClick={handleAcceptInvite}
                  disabled={busy || inputCode.trim().length !== 6}
                  type="button"
                >
                  연결
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
