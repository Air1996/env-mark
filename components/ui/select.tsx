import { ChevronDown } from 'lucide-react';
import type * as React from 'react';
import { cn } from '@/lib/utils';

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn('relative', className)}>
      <select
        className={cn(
          'h-9 w-full appearance-none rounded-md border border-input bg-transparent pl-3 pr-8 text-sm shadow-xs outline-none transition-[color,box-shadow]',
          'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
          'disabled:cursor-not-allowed disabled:opacity-50',
          '[&>option]:bg-[var(--background)] [&>option]:text-[var(--foreground)]',
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
