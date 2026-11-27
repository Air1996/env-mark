import type * as React from 'react';
import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
        'placeholder:text-muted-foreground/70 selection:bg-primary selection:text-primary-foreground',
        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}
