import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from './button';
import { cn } from './utils';

export type ConfirmDialogProps = {
  title: string;
  description?: string;
  triggerLabel: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  className?: string;
};

export function ConfirmDialog({
  title,
  description,
  triggerLabel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  className,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="primary">{triggerLabel}</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl bg-white p-6 shadow-xl',
            className
          )}
        >
          <Dialog.Title className="text-lg font-semibold text-slate-900">{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-2 text-sm text-slate-600">
              {description}
            </Dialog.Description>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <Dialog.Close asChild>
              <Button variant="ghost">{cancelLabel}</Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button variant="primary" onClick={onConfirm}>
                {confirmLabel}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
