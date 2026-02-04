import React from 'react';
import { Link } from 'react-router-dom';
import BottomTabs from '../components/BottomTabs';
import { FolderIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-white px-6 pb-28 pt-8 text-slate-900">
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <header>
          <h1
            className="text-3xl font-semibold tracking-tight text-slate-900"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            관리
          </h1>
          <p className="mt-2 text-sm text-slate-500">카테고리와 사용자를 관리하세요.</p>
        </header>

        <div className="grid gap-4">
          <Link
            to="/admin/categories"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <FolderIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-semibold text-slate-900">카테고리 관리</div>
                <div className="text-xs text-slate-500">이모지/이름/활성 상태</div>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <UsersIcon className="h-5 w-5" />
              </span>
              <div>
                <div className="text-base font-semibold text-slate-900">사용자 관리</div>
                <div className="text-xs text-slate-500">계정/권한/비밀번호</div>
              </div>
            </div>
            <span className="text-slate-400">›</span>
          </Link>
        </div>
      </div>
      <BottomTabs />
    </div>
  );
}
