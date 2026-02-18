import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from './utils';

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  maxWidth?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
};

const maxWidthClass = {
  sm: 'max-w-sm',
  md: 'max-w-md',
} as const;

export function Modal({ open, onClose, title, maxWidth = 'md', children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2',
            maxWidthClass[maxWidth],
            'rounded-2xl bg-white p-6 shadow-xl',
            className
          )}
        >
          {title ? (
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-bold text-slate-800">{title}</Dialog.Title>
              <Dialog.Close className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </Dialog.Close>
            </div>
          ) : (
            <Dialog.Title className="sr-only">Dialog</Dialog.Title>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
