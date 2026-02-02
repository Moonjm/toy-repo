import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  type Category,
  type CategoryRequest,
  updateCategory,
} from '../api/categories';
import { ApiError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const emptyForm: CategoryRequest = {
  emoji: '',
  name: '',
  isActive: true,
};

function formatError(error: unknown): string {
  if (error instanceof ApiError && error.body && typeof error.body === 'object') {
    const message = (error.body as { message?: string }).message;
    if (message) return message;
  }
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function CategoriesPage() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [createForm, setCreateForm] = useState<CategoryRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CategoryRequest>(emptyForm);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadList = (active?: boolean) => {
    setLoading(true);
    setError(null);
    return fetchCategories(active)
      .then((res) => setItems(res.data ?? []))
      .catch((err) => setError(formatError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const active = filter === 'all' ? undefined : filter === 'active';
    loadList(active);
  }, [filter]);

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
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [items]
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    try {
      await createCategory({
        ...createForm,
        emoji: createForm.emoji.trim(),
        name: createForm.name.trim(),
      });
      setNotice('새 카테고리를 추가했어요.');
      setCreateForm(emptyForm);
      await loadList(filter === 'all' ? undefined : filter === 'active');
    } catch (err) {
      setError(formatError(err));
    }
  };

  const handleEditStart = (item: Category) => {
    setEditingId(item.id);
    setEditForm({
      emoji: item.emoji,
      name: item.name,
      isActive: item.isActive,
    });
    setNotice(null);
    setError(null);
  };

  const handleEditSave = async () => {
    if (editingId == null) return;
    setBusyId(editingId);
    setError(null);
    setNotice(null);
    try {
      await updateCategory(editingId, {
        ...editForm,
        emoji: editForm.emoji.trim(),
        name: editForm.name.trim(),
      });
      setNotice('카테고리를 저장했어요.');
      setEditingId(null);
      await loadList(filter === 'all' ? undefined : filter === 'active');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: Category) => {
    const ok = window.confirm(`${item.name}을(를) 삭제할까요?`);
    if (!ok) return;
    setBusyId(item.id);
    setError(null);
    setNotice(null);
    try {
      await deleteCategory(item.id);
      setNotice('삭제가 완료됐어요.');
      await loadList(filter === 'all' ? undefined : filter === 'active');
    } catch (err) {
      setError(formatError(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#fef3c7,_#f8fafc_45%,_#e0f2fe_100%)] px-6 py-10 text-slate-900">
      <div className="pointer-events-none absolute -left-40 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(249,115,22,0.35),_rgba(249,115,22,0))]" />
      <div className="pointer-events-none absolute -right-24 bottom-12 h-80 w-80 rounded-full bg-[radial-gradient(circle,_rgba(14,165,233,0.35),_rgba(14,165,233,0))]" />

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
                <div className="absolute right-0 top-9 z-10 w-40 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
                  <Link
                    className="block rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    to="/calendar"
                    onClick={() => setMenuOpen(false)}
                  >
                    캘린더
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
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">categories</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1
                className="text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                카테고리 관리
              </h1>
              <p className="mt-2 text-base text-slate-600">
                이모지, 이름, 활성 상태를 빠르게 관리하세요.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/70 px-3 py-2 shadow-[var(--shadow)]">
              {(['all', 'active', 'inactive'] as const).map((value) => (
                <button
                  key={value}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    filter === value
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                  onClick={() => setFilter(value)}
                >
                  {value === 'all' ? '전체' : value === 'active' ? '활성' : '비활성'}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <section className="rounded-3xl bg-white/90 p-6 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">새 카테고리</h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                CREATE
              </span>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                이모지
                <input
                  value={createForm.emoji}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      emoji: event.target.value,
                    }))
                  }
                  placeholder="예: 🏋️"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-lg shadow-sm focus:border-orange-400 focus:outline-none"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                이름
                <input
                  value={createForm.name}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="예: 헬스"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base shadow-sm focus:border-orange-400 focus:outline-none"
                  required
                />
              </label>
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  활성 여부
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <button
                      type="button"
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        createForm.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isActive: true,
                        }))
                      }
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        !createForm.isActive
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isActive: false,
                        }))
                      }
                    >
                      Inactive
                    </button>
                  </div>
                </label>
              </div>
              <button
                className="mt-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:translate-y-[-1px]"
                type="submit"
              >
                추가하기
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white/90 p-6 shadow-[var(--shadow)] backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">카테고리 목록</h2>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                {sortedItems.length} items
              </span>
            </div>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {notice && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {notice}
              </div>
            )}

            <div className="mt-5 grid gap-4">
              {loading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  데이터를 불러오는 중입니다...
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                  아직 등록된 카테고리가 없습니다.
                </div>
              ) : (
                sortedItems.map((item) => {
                  const isEditing = editingId === item.id;
                  const busy = busyId === item.id;
                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 animate-[fadeUp_0.5s_ease]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.emoji}</span>
                          <div>
                            <p className="text-base font-semibold text-slate-900">{item.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.isActive
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                          <button
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-slate-300"
                            onClick={() => handleEditStart(item)}
                          >
                            편집
                          </button>
                          <button
                            className="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:border-red-300"
                            onClick={() => handleDelete(item)}
                            disabled={busy}
                          >
                            삭제
                          </button>
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 animate-[floatIn_0.4s_ease]">
                          <div className="grid gap-3 md:grid-cols-2">
                            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Emoji
                              <input
                                value={editForm.emoji}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    emoji: event.target.value,
                                  }))
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base focus:border-orange-400 focus:outline-none"
                              />
                            </label>
                            <label className="grid gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Name
                              <input
                                value={editForm.name}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                  }))
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base focus:border-orange-400 focus:outline-none"
                              />
                            </label>
                          </div>
                          <div className="grid gap-3">
                            <div className="md:col-span-3">
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                              </span>
                              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                                <button
                                  type="button"
                                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                    editForm.isActive
                                      ? 'bg-emerald-500 text-white'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                  onClick={() =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      isActive: true,
                                    }))
                                  }
                                >
                                  Active
                                </button>
                                <button
                                  type="button"
                                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                                    !editForm.isActive
                                      ? 'bg-slate-900 text-white'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                  onClick={() =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      isActive: false,
                                    }))
                                  }
                                >
                                  Inactive
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                              onClick={handleEditSave}
                              disabled={busy}
                            >
                              저장
                            </button>
                            <button
                              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                              onClick={() => setEditingId(null)}
                              disabled={busy}
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
