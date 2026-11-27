import type * as React from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  className,
  variant = 'outline',
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'outline' | 'muted' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        variant === 'outline'
          ? 'border border-border text-muted-foreground'
          : 'bg-muted text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function Separator({ className }: { className?: string }) {
  return <div role="separator" className={cn('h-px w-full shrink-0 bg-border', className)} />;
}
