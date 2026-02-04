import * as React from 'react';
import { cn } from './utils';

export type FormFieldProps = {
  label?: React.ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  hintClassName?: string;
  errorClassName?: string;
  children: React.ReactNode;
};

export function FormField({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  labelClassName,
  hintClassName,
  errorClassName,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('grid gap-2', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className={cn(
            'flex items-center gap-1 text-sm font-medium text-slate-700',
            labelClassName
          )}
        >
          <span>{label}</span>
          {required ? <span className="text-rose-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className={cn('text-xs text-rose-600', errorClassName)}>{error}</p>
      ) : hint ? (
        <p className={cn('text-xs text-slate-500', hintClassName)}>{hint}</p>
      ) : null}
    </div>
  );
}
