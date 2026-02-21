import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './button';
import { cn } from './utils';

export type ConfirmDialogProps = {
  title: string;
  description?: string;
  triggerLabel?: string;
  trigger?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  className?: string;
};

export function ConfirmDialog({
  title,
  description,
  triggerLabel,
  trigger,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      {trigger ? (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      ) : (
        <Dialog.Trigger asChild>
          <Button variant="primary">{triggerLabel ?? 'Open dialog'}</Button>
        </Dialog.Trigger>
      )}
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[3px]"
          onClick={(e) => e.stopPropagation()}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border border-white/70 bg-white/95 px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.2)]',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Dialog.Title className="text-center text-[17px] font-semibold text-slate-900">
            {title}
          </Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-2 text-center text-[13px] leading-5 text-slate-600">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Dialog.Close asChild>
              <Button variant="secondary" size="md" radius="xl">
                {cancelLabel}
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary" size="md" radius="xl" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
