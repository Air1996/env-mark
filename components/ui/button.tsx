import type * as React from 'react';
import { cn } from '@/lib/utils';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type Size = 'default' | 'sm' | 'xs' | 'icon' | 'icon-sm';

const VARIANTS: Record<Variant, string> = {
  default:
    'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 active:bg-primary/80',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/70',
  outline:
    'border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-white shadow-xs hover:bg-destructive/90',
  link: 'text-primary underline-offset-4 hover:underline',
};

const SIZES: Record<Size, string> = {
  default: 'h-9 gap-2 px-4 text-sm',
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  xs: 'h-7 gap-1.5 px-2.5 text-xs',
  icon: 'size-9',
  'icon-sm': 'size-8',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  className,
  variant = 'default',
  size = 'default',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors outline-none',
        'focus-visible:ring-[3px] focus-visible:ring-ring/40',
        'disabled:pointer-events-none disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
