import * as React from 'react';
import { cn } from './utils';

export type TextareaProps = React.ComponentPropsWithoutRef<'textarea'>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
