import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ConfirmDialog, FormField, Input } from '@repo/ui';
import { Bars3Icon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  reorderCategory,
  type Category,
  type CategoryRequest,
  updateCategory,
} from '../api/categories';
import { PageHeader } from '@repo/auth';
import { queryKeys } from '../queryKeys';

const emptyForm: CategoryRequest = {
  emoji: '',
  name: '',
  isActive: true,
};

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

function SortableItem({
  item,
  isEditing,
  busy,
  editForm,
  setEditForm,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
}: {
  item: Category;
  isEditing: boolean;
  busy: boolean;
  editForm: CategoryRequest;
  setEditForm: React.Dispatch<React.SetStateAction<CategoryRequest>>;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    position: isDragging ? ('relative' as const) : undefined,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition ${
        isDragging ? 'shadow-lg opacity-90' : 'hover:border-slate-300'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="cursor-grab touch-none rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
            {...attributes}
            {...listeners}
            aria-label="드래그하여 순서 변경"
            title="드래그하여 순서 변경"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <span className="text-3xl">{item.emoji}</span>
          <div>
            <p className="text-base font-semibold text-slate-900">{item.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
            }`}
          >
            {item.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <Button
            variant="secondary"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-600"
            onClick={onEditStart}
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
            onConfirm={onDelete}
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
                    editForm.isActive ? 'bg-emerald-500 text-white hover:bg-emerald-500' : ''
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
                    !editForm.isActive ? 'bg-slate-900 text-white hover:bg-slate-900' : ''
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
              onClick={onEditSave}
              disabled={busy}
              type="button"
            >
              저장
            </Button>
            <Button
              variant="secondary"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600"
              onClick={onEditCancel}
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
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<CategoryRequest>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CategoryRequest>(emptyForm);
  const [notice, setNotice] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => fetchCategories().then((res) => res.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createCategory({
        ...createForm,
        emoji: createForm.emoji.trim(),
        name: createForm.name.trim(),
      }),
    onSuccess: () => {
      setNotice('새 카테고리를 추가했어요.');
      setCreateForm(emptyForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) =>
      updateCategory(id, {
        ...editForm,
        emoji: editForm.emoji.trim(),
        name: editForm.name.trim(),
      }),
    onSuccess: () => {
      setNotice('카테고리를 저장했어요.');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      setNotice('삭제가 완료됐어요.');
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const reorderMutation = useMutation({
    mutationFn: ({ targetId, beforeId }: { targetId: number; beforeId: number | null }) =>
      reorderCategory(targetId, beforeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
    onError: (err) => {
      setError(formatError(err));
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
    },
  });

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id),
    [items]
  );

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (createMutation.isPending) return;
    setError(null);
    setNotice(null);
    createMutation.mutate();
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

  const handleEditSave = () => {
    if (editingId == null) return;
    setError(null);
    setNotice(null);
    updateMutation.mutate(editingId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
    const newIndex = sortedItems.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    // Optimistic reorder
    const reordered = [...sortedItems];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    queryClient.setQueryData(
      queryKeys.categories.list(),
      reordered.map((item, i) => ({ ...item, sortOrder: i + 1 }))
    );

    const targetId = Number(active.id);
    const beforeId = newIndex < reordered.length - 1 ? reordered[newIndex + 1].id : null;

    setError(null);
    setNotice(null);
    reorderMutation.mutate({ targetId, beforeId });
  };

  const handleDelete = (item: Category) => {
    setError(null);
    setNotice(null);
    deleteMutation.mutate(item.id);
  };

  const isBusy = (id: number) =>
    (updateMutation.isPending && updateMutation.variables === id) ||
    (deleteMutation.isPending && deleteMutation.variables === id);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHeader title="카테고리 관리" backTo="/admin" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-8">
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
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? '추가 중...' : '추가하기'}
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
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={sortedItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {sortedItems.map((item) => (
                      <SortableItem
                        key={item.id}
                        item={item}
                        isEditing={editingId === item.id}
                        busy={isBusy(item.id)}
                        editForm={editForm}
                        setEditForm={setEditForm}
                        onEditStart={() => handleEditStart(item)}
                        onEditSave={handleEditSave}
                        onEditCancel={() => setEditingId(null)}
                        onDelete={() => handleDelete(item)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
