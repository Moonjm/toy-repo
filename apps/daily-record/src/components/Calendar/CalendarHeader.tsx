import { Link } from 'react-router-dom';
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { IconButton } from '@repo/ui';
import dayjs from 'dayjs';

type CalendarHeaderProps = {
  visibleMonth: string;
  pickerOpen: boolean;
  onTogglePicker: () => void;
  onOpenDrawer: () => void;
};

export default function CalendarHeader({
  visibleMonth,
  pickerOpen,
  onTogglePicker,
  onOpenDrawer,
}: CalendarHeaderProps) {
  return (
    <header className="flex flex-shrink-0 items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <IconButton
          variant="ghost"
          size="md"
          onClick={onOpenDrawer}
          style={{ '--btn-radius': 'var(--radius-full)' } as React.CSSProperties}
          className="text-slate-700 [&>svg]:h-6 [&>svg]:w-6"
        >
          <Bars3Icon />
        </IconButton>
        <button type="button" className="flex items-center gap-1" onClick={onTogglePicker}>
          <span className="text-lg font-semibold tracking-tight text-slate-800">
            {dayjs(visibleMonth + '-01').format('YYYY. M')}
          </span>
          {pickerOpen ? (
            <ChevronUpIcon className="h-4 w-4 stroke-2 text-slate-500" />
          ) : (
            <ChevronDownIcon className="h-4 w-4 stroke-2 text-slate-500" />
          )}
        </button>
      </div>
      <Link
        to="/search"
        className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
      >
        <MagnifyingGlassIcon className="h-6 w-6 text-slate-700" />
      </Link>
    </header>
  );
}
