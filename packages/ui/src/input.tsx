import * as React from 'react';
import { cn } from './utils';

export type InputProps = React.ComponentPropsWithoutRef<'input'>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-slate-200',
          'disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
