import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightStartOnRectangleIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@repo/auth';
import { Button, ConfirmDialog, FormField, Input, Modal } from '@repo/ui';
import {
  fetchFamilyTrees,
  createFamilyTree,
  updateFamilyTree,
  deleteFamilyTree,
} from '../api/familyTrees';
import { queryKeys } from '../queryKeys';
import type { FamilyTreeRequest } from '../types';

export default function TreeListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const isAdmin = user?.authority === 'ADMIN';
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editTarget, setEditTarget] = useState<{
    id: number;
    name: string;
    description: string;
  } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.trees,
    queryFn: fetchFamilyTrees,
  });

  const createMutation = useMutation({
    mutationFn: (payload: FamilyTreeRequest) => createFamilyTree(payload),
    onSuccess: (treeId) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setShowCreate(false);
      setName('');
      setDescription('');
      navigate(`/trees/${treeId}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FamilyTreeRequest }) =>
      updateFamilyTree(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.trees });
      setEditTarget(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFamilyTree(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.trees }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() || null });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget || !editTarget.name.trim()) return;
    updateMutation.mutate({
      id: editTarget.id,
      payload: { name: editTarget.name.trim(), description: editTarget.description.trim() || null },
    });
  };

  const trees = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">가계도</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button
                variant="secondary"
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
              >
                <UsersIcon className="w-4 h-4" />
                사용자 관리
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 rounded-lg hover:bg-indigo-600 text-sm"
            >
              <PlusIcon className="w-4 h-4" />새 가계도
            </Button>
            <Button
              variant="secondary"
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {isLoading && <div className="text-center py-12 text-slate-400">불러오는 중...</div>}

        {!isLoading && trees.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            가계도가 없습니다. 새 가계도를 만들어보세요.
          </div>
        )}

        <div className="space-y-3">
          {trees.map((tree) => (
            <div
              key={tree.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex items-center justify-between"
              onClick={() => navigate(`/trees/${tree.id}`)}
            >
              <div>
                <h2 className="font-semibold text-slate-800">{tree.name}</h2>
                {tree.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{tree.description}</p>
                )}
                <span className="text-xs text-indigo-500 font-medium mt-1 inline-block">
                  {tree.myRole}
                </span>
              </div>
              {tree.myRole === 'OWNER' && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTarget({
                        id: tree.id,
                        name: tree.name,
                        description: tree.description ?? '',
                      });
                    }}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <PencilSquareIcon className="w-4 h-4" />
                  </Button>
                  <ConfirmDialog
                    title="가계도 삭제"
                    description={`"${tree.name}" 가계도를 삭제하시겠습니까?`}
                    confirmLabel="삭제"
                    cancelLabel="취소"
                    onConfirm={() => deleteMutation.mutate(tree.id)}
                    trigger={
                      <Button
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="새 가계도">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="이름" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              autoFocus
            />
          </FormField>
          <FormField label="설명">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
              rows={3}
              maxLength={500}
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 rounded-lg text-sm"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || createMutation.isPending}
              className="flex-1 py-2.5 bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50 text-sm"
            >
              {createMutation.isPending ? '생성 중...' : '생성'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Dialog */}
      <Modal open={editTarget !== null} onClose={() => setEditTarget(null)} title="가계도 수정">
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormField label="이름" required>
            <Input
              value={editTarget?.name ?? ''}
              onChange={(e) => setEditTarget((prev) => prev && { ...prev, name: e.target.value })}
              maxLength={100}
              required
              autoFocus
            />
          </FormField>
          <FormField label="설명">
            <textarea
              value={editTarget?.description ?? ''}
              onChange={(e) =>
                setEditTarget((prev) => prev && { ...prev, description: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none"
              rows={3}
              maxLength={500}
            />
          </FormField>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditTarget(null)}
              className="flex-1 py-2.5 rounded-lg text-sm"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!editTarget?.name.trim() || updateMutation.isPending}
              className="flex-1 py-2.5 bg-indigo-500 rounded-lg hover:bg-indigo-600 disabled:opacity-50 text-sm"
            >
              {updateMutation.isPending ? '수정 중...' : '수정'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
