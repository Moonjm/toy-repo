import * as React from 'react';
import { cn } from './utils';

export type SelectProps = React.ComponentPropsWithoutRef<'select'>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'select-field w-full rounded-xl border border-slate-200 bg-white px-3 py-2 pr-10 text-base text-slate-800 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-slate-200',
          className
        )}
        {...props}
      />
    );
  }
);

Select.displayName = 'Select';
