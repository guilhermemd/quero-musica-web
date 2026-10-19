'use client';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva('ui-button', {
  variants: {
    variant: {
      default: 'ui-button--default',
      secondary: 'ui-button--secondary',
      outline: 'ui-button--outline',
      ghost: 'ui-button--ghost',
      destructive: 'ui-button--destructive',
    },
    size: {
      default: 'ui-button--size-default',
      sm: 'ui-button--size-sm',
      lg: 'ui-button--size-lg',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
