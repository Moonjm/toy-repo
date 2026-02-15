import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, ConfirmDialog, FormField, Input, Select } from '@repo/ui';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  updateAdminUser,
  type AdminUser,
  type Authority,
} from '../api/adminUsers';
import PageHeader from '../components/PageHeader';
import { queryKeys } from '../queryKeys';

const emptyCreateForm = {
  username: '',
  name: '',
  password: '',
};

type EditForm = {
  password: string;
  name: string;
  authority: Authority;
};

function formatError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return '요청 처리 중 문제가 발생했습니다.';
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({
    password: '',
    name: '',
    authority: 'USER',
  });

  const { data: items = [], isLoading: loading } = useQuery({
    queryKey: queryKeys.adminUsers.list(),
    queryFn: () => fetchAdminUsers().then((res) => res.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminUser({
        username: createForm.username.trim(),
        name: createForm.name.trim(),
        password: createForm.password.trim(),
      }),
    onSuccess: () => {
      setNotice('사용자를 추가했어요.');
      setCreateForm(emptyCreateForm);
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) =>
      updateAdminUser(id, {
        password: editForm.password.trim(),
        name: editForm.name.trim(),
        authority: editForm.authority,
      }),
    onSuccess: () => {
      setNotice('사용자 정보를 저장했어요.');
      setEditingId(null);
      setEditForm({ password: '', name: '', authority: 'USER' });
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminUser(id),
    onSuccess: () => {
      setNotice('삭제가 완료됐어요.');
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all });
    },
    onError: (err) => {
      setError(formatError(err));
    },
  });

  const sortedItems = useMemo(() => [...items].sort((a, b) => a.id - b.id), [items]);

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (createMutation.isPending) return;
    setError(null);
    setNotice(null);
    createMutation.mutate();
  };

  const handleEditStart = (item: AdminUser) => {
    setEditingId(item.id);
    setEditForm({ password: '', name: item.name, authority: item.authority });
    setNotice(null);
    setError(null);
  };

  const handleEditSave = () => {
    if (editingId == null) return;
    setError(null);
    setNotice(null);
    updateMutation.mutate(editingId);
  };

  const handleDelete = (item: AdminUser) => {
    setError(null);
    setNotice(null);
    deleteMutation.mutate(item.id);
  };

  const isBusy = (id: number) =>
    (updateMutation.isPending && updateMutation.variables === id) ||
    (deleteMutation.isPending && deleteMutation.variables === id);

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PageHeader title="사용자 관리" backTo="/admin" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-8">
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
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">새 사용자</h2>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                CREATE
              </span>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={handleCreate}>
              <FormField label="아이디">
                <Input
                  value={createForm.username}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      username: event.target.value,
                    }))
                  }
                  placeholder="예: user1"
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
                  placeholder="예: 홍길동"
                  required
                />
              </FormField>
              <FormField label="비밀번호">
                <Input
                  type="password"
                  value={createForm.password}
                  onChange={(event) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="초기 비밀번호"
                  required
                />
              </FormField>
              <Button
                type="submit"
                className="rounded-2xl px-4 py-3 text-sm font-semibold"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? '추가 중...' : '사용자 추가'}
              </Button>
            </form>
            <p className="mt-4 text-xs text-slate-500">
              생성된 계정은 기본 권한이 USER이며, 권한은 오른쪽에서 수정할 수 있어요.
            </p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">사용자 목록</h2>
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
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
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-base font-semibold text-slate-900">{item.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{item.username}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isEditing && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {item.authority}
                            </span>
                          )}
                          <Button
                            variant="secondary"
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600"
                            onClick={() => handleEditStart(item)}
                            type="button"
                            aria-label="수정"
                            title="수정"
                            disabled={isEditing || isBusy(item.id)}
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </Button>
                          <ConfirmDialog
                            title="사용자 삭제"
                            description={`${item.username} 계정을 삭제할까요?`}
                            confirmLabel="삭제"
                            cancelLabel="취소"
                            onConfirm={() => handleDelete(item)}
                            trigger={
                              <Button
                                variant="secondary"
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-white/80 text-red-600"
                                disabled={isBusy(item.id)}
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
                        <div className="mt-4 grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-[1fr_1fr]">
                          <FormField
                            label="이름"
                            labelClassName="text-xs font-semibold text-slate-600"
                          >
                            <Input
                              value={editForm.name}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: event.target.value,
                                }))
                              }
                              placeholder="이름"
                              required
                            />
                          </FormField>
                          <FormField
                            label="비밀번호 변경"
                            labelClassName="text-xs font-semibold text-slate-600"
                          >
                            <Input
                              type="password"
                              value={editForm.password}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  password: event.target.value,
                                }))
                              }
                              placeholder="새 비밀번호"
                              required
                            />
                          </FormField>
                          <FormField
                            label="권한"
                            labelClassName="text-xs font-semibold text-slate-600"
                          >
                            <Select
                              value={editForm.authority}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  authority: event.target.value as Authority,
                                }))
                              }
                            >
                              <option value="USER">USER</option>
                              <option value="ADMIN">ADMIN</option>
                            </Select>
                          </FormField>
                          <div className="flex items-center gap-2 md:col-span-2">
                            <Button
                              variant="primary"
                              className="rounded-xl px-4 py-2 text-sm font-semibold text-white"
                              onClick={handleEditSave}
                              disabled={isBusy(item.id)}
                              type="button"
                            >
                              저장
                            </Button>
                            <Button
                              variant="secondary"
                              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600"
                              onClick={() => {
                                setEditingId(null);
                                setEditForm({ password: '', name: '', authority: 'USER' });
                              }}
                              type="button"
                            >
                              취소
                            </Button>
                          </div>
                        </div>
                      )}
                    </article>
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
