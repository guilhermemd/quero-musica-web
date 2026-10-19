import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const alertVariants = cva('ui-alert', {
  variants: {
    variant: {
      default: 'ui-alert--default',
      warning: 'ui-alert--warning',
      destructive: 'ui-alert--destructive',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type AlertProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>;

export function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

export function AlertTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('ui-alert__title', className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('ui-alert__description', className)} {...props} />;
}
