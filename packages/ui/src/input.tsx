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
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-base text-slate-800',
          'focus:outline-none focus:ring-2 focus:ring-slate-200',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
