import React from 'react';

export type FullPageLoaderProps = {
  label?: string;
};

export function FullPageLoader({ label = '로딩 중...' }: FullPageLoaderProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-700 shadow-[var(--shadow)]">
        {label}
      </div>
    </div>
  );
}
