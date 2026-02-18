import * as React from 'react';
import { cn } from './utils';

export type RadioOption<T extends string = string> = {
  value: T;
  label: string;
};

export type RadioGroupProps<T extends string = string> = {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: RadioOption<T>[];
  className?: string;
};

export function RadioGroup<T extends string = string>({
  name,
  value,
  onChange,
  options,
  className,
}: RadioGroupProps<T>) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center gap-1 text-sm text-slate-600 cursor-pointer"
        >
          <input
            type="radio"
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="accent-indigo-500"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
