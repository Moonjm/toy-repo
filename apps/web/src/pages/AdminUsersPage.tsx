import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  type AdminUser,
  type Authority,
  updateAdminUser,
} from '../api/adminUsers';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const emptyCreateForm = {
  username: '',
  password: '',
};

type EditForm = {
  password: string;
  authority: Authority;
};

function formatError(error: unknown): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const message = (error.body as { message?: string }).message;
    if (message) return message;
  }
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function AdminUsersPage() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ password: '', authority: 'USER' });
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadList = () => {
    setLoading(true);
    setError(null);
    return fetchAdminUsers()
      .then((res) => setItems(res.data ?? []))
      .catch((err) => setError(formatError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [menuOpen]);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.id - b.id),
    [items]
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await createAdminUser({
        username: createForm.username.trim(),
        password: createForm.password.trim(),
      });
      setNotice('사용자를 추가했어요.');
      setCreateForm(emptyCreateForm);
      await loadList();
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleEditStart = (item: AdminUser) => {
    setEditingId(item.id);
    setEditForm({ password: '', authority: item.authority });
    setNotice(null);
    setError(null);
  };

  const handleEditSave = async () => {
    if (editingId == null) return;
    setBusyId(editingId);
    setError(null);
    setNotice(null);
    try {
      await updateAdminUser(editingId, {
        password: editForm.password.trim(),
        authority: editForm.authority,
      });
      setNotice('사용자 정보를 저장했어요.');
      setEditingId(null);
      setEditForm({ password: '', authority: 'USER' });
      await loadList();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: AdminUser) => {
    const ok = window.confirm(`${item.username} 계정을 삭제할까요?`);
    if (!ok) return;
    setBusyId(item.id);
    setError(null);
    setNotice(null);
    try {
      await deleteAdminUser(item.id);
      setNotice('삭제가 완료됐어요.');
      await loadList();
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#f0fdf4_100%)] px-6 py-10 text-slate-900">
      <div className="pointer-events-none absolute -left-40 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(59,130,246,0.3),_rgba(59,130,246,0))]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(34,197,94,0.3),_rgba(34,197,94,0))]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {user ? `${user.username} admin` : 'admin'}
            </div>
            <div ref={menuRef} className="relative flex items-center gap-2">
              <button
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                메뉴
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-9 z-10 w-44 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    to="/calendar"
                    onClick={() => setMenuOpen(false)}
                  >
                    캘린더
                  </Link>
                  <Link
                    className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    to="/admin/categories"
                    onClick={() => setMenuOpen(false)}
                  >
                    카테고리 관리
                  </Link>
                </div>
              )}
              <button
                className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600"
                onClick={logout}
              >
                로그아웃
              </button>
            </div>
          </div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">users</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                사용자 관리
              </h1>
              <p className="mt-2 text-base text-slate-600">
                계정 생성, 권한 수정, 비밀번호 변경을 관리하세요.
              </p>
            </div>
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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
          <section className="rounded-3xl bg-white/90 p-6 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">새 사용자</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                CREATE
              </span>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                아이디
                <input
                  value={createForm.username}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  placeholder="예: user1"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-blue-400 focus:outline-none"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                비밀번호
                <input
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="초기 비밀번호"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-blue-400 focus:outline-none"
                  required
                />
              </label>
              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
              >
                사용자 추가
              </button>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              생성된 계정은 기본 권한이 USER이며, 권한은 오른쪽에서 수정할 수 있어요.
            </p>
          </section>

          <section className="rounded-3xl bg-white/90 p-6 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">사용자 목록</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {sortedItems.length} users
              </span>
            </div>
            {loading ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                불러오는 중...
              </div>
            ) : sortedItems.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
                등록된 사용자가 없습니다.
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {sortedItems.map((item) => {
                  const isEditing = editingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{item.username}</div>
                          <div className="mt-1 text-xs text-slate-500">ID: {item.id}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <button
                              className="rounded-full border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
                              onClick={handleEditSave}
                              disabled={busyId === item.id}
                            >
                              저장
                            </button>
                          ) : (
                            <button
                              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600"
                              onClick={() => handleEditStart(item)}
                            >
                              수정
                            </button>
                          )}
                          <button
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
                            onClick={() => handleDelete(item)}
                            disabled={busyId === item.id}
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
                          <label className="grid gap-2 text-xs font-semibold text-slate-600">
                            비밀번호 변경
                            <input
                              type="password"
                              value={editForm.password}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  password: event.target.value,
                                }))
                              }
                              placeholder="새 비밀번호"
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                              required
                            />
                          </label>
                          <label className="grid gap-2 text-xs font-semibold text-slate-600">
                            권한
                            <select
                              value={editForm.authority}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  authority: event.target.value as Authority,
                                }))
                              }
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          </label>
                          <button
                            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                            onClick={() => {
                              setEditingId(null);
                              setEditForm({ password: '', authority: 'USER' });
                            }}
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2 py-1">{item.authority}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
