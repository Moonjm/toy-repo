import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

export const iconButtonVariants = cva(
  [
    'inline-flex items-center justify-center transition',
    'cursor-pointer select-none',
    'rounded-[var(--btn-radius)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
    'disabled:pointer-events-none disabled:opacity-50',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-slate-900 text-white hover:bg-slate-800',
        accent: 'bg-[var(--accent,#6366f1)] text-white hover:brightness-110',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
        ghost: 'text-slate-900 hover:bg-slate-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        xs: 'h-6 w-6 [&>svg]:h-3 [&>svg]:w-3',
        sm: 'h-7 w-7 [&>svg]:h-3.5 [&>svg]:w-3.5',
        md: 'h-9 w-9 [&>svg]:h-4 [&>svg]:w-4',
        lg: 'h-11 w-11 [&>svg]:h-5 [&>svg]:w-5',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

export type IconButtonProps = React.ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof iconButtonVariants> & {
    asChild?: boolean;
  };

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ asChild, className, variant, size, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp ref={ref} className={cn(iconButtonVariants({ variant, size }), className)} {...props} />
    );
  }
);

IconButton.displayName = 'IconButton';
