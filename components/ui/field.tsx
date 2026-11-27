import type * as React from 'react';
import { cn } from '@/lib/utils';

/** 一行设置项：左侧标题与说明，右侧控件 */
export function SettingRow({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-6 py-3.5', className)}>
      <div className="min-w-0 space-y-1">
        <div className="text-[13px] leading-none font-medium">{title}</div>
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function SectionTitle({
  title,
  description,
  className,
}: {
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      <span className="block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-[11px] text-muted-foreground/80">{hint}</span> : null}
    </label>
  );
}
