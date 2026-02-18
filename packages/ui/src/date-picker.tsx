import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import * as Popover from '@radix-ui/react-popover';
import 'react-day-picker/style.css';
import { cn } from './utils';

export type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

function parseDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(date: Date): string {
  return `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;
}

export function DatePicker({
  value,
  onChange,
  placeholder = '날짜 선택',
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const parsedDate = value ? parseDate(value) : undefined;
  const selected = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate : undefined;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(formatDate(date));
    } else {
      onChange?.('');
    }
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-base',
            'focus:outline-none focus:ring-2 focus:ring-slate-200',
            'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
            value ? 'text-slate-800' : 'text-slate-400',
            className
          )}
        >
          <span className="flex items-center gap-2">
            <svg
              className="h-4 w-4 shrink-0 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
              />
            </svg>
            {selected ? formatDisplay(selected) : placeholder}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={4}
          className="z-50 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <DayPicker
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(1900, 0)}
            endMonth={new Date(new Date().getFullYear() + 5, 11)}
            selected={selected}
            onSelect={handleSelect}
            locale={ko}
            defaultMonth={selected}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
