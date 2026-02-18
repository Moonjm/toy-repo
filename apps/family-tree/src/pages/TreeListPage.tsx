import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRightStartOnRectangleIcon,
  PlusIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '@repo/auth';
import { fetchFamilyTrees, createFamilyTree, deleteFamilyTree } from '../api/familyTrees';
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteFamilyTree(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.trees }),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() || null });
  };

  const trees = data?.data ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">가계도</h1>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
              >
                <UsersIcon className="w-4 h-4" />
                사용자 관리
              </button>
            )}
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm font-medium transition-colors"
            >
              <PlusIcon className="w-4 h-4" />새 가계도
            </button>
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600 transition-colors"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
              로그아웃
            </button>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`"${tree.name}" 가계도를 삭제하시겠습니까?`)) {
                      deleteMutation.mutate(tree.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Dialog */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">새 가계도</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">이름 *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  maxLength={100}
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">설명</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || createMutation.isPending}
                  className="flex-1 py-2.5 bg-indigo-500 text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 text-sm"
                >
                  {createMutation.isPending ? '생성 중...' : '생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
