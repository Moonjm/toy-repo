import React, { useEffect, useMemo, useState } from 'react';
import { Button, ConfirmDialog, FormField, Input } from '@repo/ui';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  type Category,
  type CategoryRequest,
  updateCategory,
} from '../api/categories';
import { ApiError } from '../api/client';
import BottomTabs from '../components/BottomTabs';

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
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CategoryRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CategoryRequest>(emptyForm);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadList = () => {
    setLoading(true);
    setError(null);
    return fetchCategories()
      .then((res) => setItems(res.data ?? []))
      .catch((err) => setError(formatError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadList();
  }, []);

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
    <div className="min-h-screen bg-white px-6 pb-28 pt-10 text-slate-900">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Button
              variant="secondary"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 p-0 text-slate-600 !rounded-full"
              asChild
            >
              <a href="/admin" aria-label="뒤로가기" title="뒤로가기">
                <span className="text-lg leading-none">‹</span>
              </a>
            </Button>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
                카테고리 관리
              </h1>
              <p className="mt-2 text-base text-slate-600">
                이모지, 이름, 활성 상태를 빠르게 관리하세요.
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">새 카테고리</h2>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                CREATE
              </span>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
              <FormField label="이모지">
                <Input
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
              </FormField>
              <FormField label="이름">
                <Input
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
              </FormField>
              <div className="grid gap-4">
                <FormField label="활성 여부">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                    <Button
                      type="button"
                      variant={createForm.isActive ? 'primary' : 'secondary'}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                        createForm.isActive ? 'bg-emerald-500 text-white hover:bg-emerald-500' : ''
                      }`}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isActive: true,
                        }))
                      }
                    >
                      Active
                    </Button>
                    <Button
                      type="button"
                      variant={!createForm.isActive ? 'primary' : 'secondary'}
                      className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold ${
                        !createForm.isActive ? 'bg-slate-900 text-white hover:bg-slate-900' : ''
                      }`}
                      onClick={() =>
                        setCreateForm((prev) => ({
                          ...prev,
                          isActive: false,
                        }))
                      }
                    >
                      Inactive
                    </Button>
                  </div>
                </FormField>
              </div>
              <Button
                className="mt-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-orange-200 transition hover:translate-y-[-1px]"
                type="submit"
              >
                추가하기
              </Button>
            </form>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
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
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
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
                          <Button
                            variant="secondary"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600"
                            onClick={() => handleEditStart(item)}
                            type="button"
                            aria-label="편집"
                            title="편집"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                          <ConfirmDialog
                            title="카테고리 삭제"
                            description={`${item.name}을(를) 삭제할까요?`}
                            confirmLabel="삭제"
                            cancelLabel="취소"
                            onConfirm={() => handleDelete(item)}
                            trigger={
                              <Button
                                variant="secondary"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 text-red-600 hover:border-red-300"
                                disabled={busy}
                                type="button"
                                aria-label="삭제"
                                title="삭제"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            }
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4">
                          <div className="grid gap-3 md:grid-cols-2">
                            <FormField
                              label="Emoji"
                              labelClassName="text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              <Input
                                value={editForm.emoji}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    emoji: event.target.value,
                                  }))
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base focus:border-orange-400 focus:outline-none"
                              />
                            </FormField>
                            <FormField
                              label="Name"
                              labelClassName="text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              <Input
                                value={editForm.name}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                  }))
                                }
                                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-base focus:border-orange-400 focus:outline-none"
                              />
                            </FormField>
                          </div>
                          <div className="grid gap-3">
                            <div className="md:col-span-3">
                              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Status
                              </span>
                              <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2">
                                <Button
                                  type="button"
                                  variant={editForm.isActive ? 'primary' : 'secondary'}
                                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                                    editForm.isActive
                                      ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      isActive: true,
                                    }))
                                  }
                                >
                                  Active
                                </Button>
                                <Button
                                  type="button"
                                  variant={!editForm.isActive ? 'primary' : 'secondary'}
                                  className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold ${
                                    !editForm.isActive
                                      ? 'bg-slate-900 text-white hover:bg-slate-900'
                                      : ''
                                  }`}
                                  onClick={() =>
                                    setEditForm((prev) => ({
                                      ...prev,
                                      isActive: false,
                                    }))
                                  }
                                >
                                  Inactive
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                              onClick={handleEditSave}
                              disabled={busy}
                              type="button"
                            >
                              저장
                            </Button>
                            <Button
                              variant="secondary"
                              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600"
                              onClick={() => setEditingId(null)}
                              disabled={busy}
                              type="button"
                            >
                              취소
                            </Button>
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
      <BottomTabs />
    </div>
  );
}
