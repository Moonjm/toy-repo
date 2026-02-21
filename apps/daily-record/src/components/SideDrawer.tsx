import { Link } from 'react-router-dom';
import { Button, IconButton, ConfirmDialog } from '@repo/ui';
import {
  XMarkIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

type SideDrawerProps = {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onLogout: () => Promise<void>;
};

export default function SideDrawer({ open, onClose, isAdmin, onLogout }: SideDrawerProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col bg-white shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <span className="text-base font-semibold text-slate-800">메뉴</span>
          <IconButton
            variant="none"
            size="md"
            radius="full"
            onClick={onClose}
            className="hover:bg-slate-100 text-slate-500"
          >
            <XMarkIcon />
          </IconButton>
        </div>
        <nav className="flex flex-col py-2">
          {[
            { to: '/pair', label: '페어', Icon: HeartIcon },
            { to: '/stats', label: '통계', Icon: ChartBarIcon },
            ...(isAdmin ? [{ to: '/admin', label: '관리', Icon: WrenchScrewdriverIcon }] : []),
            { to: '/me', label: '내정보', Icon: UserCircleIcon },
          ].map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              onClick={onClose}
            >
              <Icon className="h-5 w-5 text-slate-500" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-slate-100 px-4 py-3">
          <ConfirmDialog
            title="로그아웃"
            description="로그아웃 하시겠어요?"
            confirmLabel="로그아웃"
            cancelLabel="취소"
            onConfirm={onLogout}
            trigger={
              <Button
                variant="none"
                size="md"
                type="button"
                className="w-full justify-start hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              >
                <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                로그아웃
              </Button>
            }
          />
        </div>
      </div>
    </>
  );
}
