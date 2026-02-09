import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../auth/AuthContext';

export default function BottomTabs() {
  const location = useLocation();
  const { user } = useAuth();
  const tabs = [
    { to: '/calendar', label: '캘린더', Icon: CalendarDaysIcon },
    { to: '/stats', label: '통계', Icon: ChartBarIcon },
    { to: '/search', label: '검색', Icon: MagnifyingGlassIcon },
    ...(user?.authority === 'ADMIN'
      ? [{ to: '/admin', label: '관리', Icon: WrenchScrewdriverIcon }]
      : []),
    { to: '/me', label: '내정보', Icon: UserCircleIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40">
      <div className="mx-auto w-full max-w-md px-4 pb-4">
        <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-2 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="flex items-center justify-around">
            {tabs.map(({ to, label, Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex flex-col items-center gap-1 text-xs font-semibold transition ${
                    isActive ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
