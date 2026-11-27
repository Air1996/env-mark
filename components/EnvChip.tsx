import type { EnvKey } from '@/lib/types';
import { cn, hexToRgba, readableText } from '@/lib/utils';

export function EnvChip({
  env,
  label,
  color,
  size = 'sm',
  solid = false,
  className,
}: {
  env?: EnvKey | null;
  label: string;
  color: string;
  size?: 'sm' | 'xs';
  solid?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-1.5 py-0.5 text-[10px]',
        className,
      )}
      style={
        solid
          ? { background: color, color: readableText(color) }
          : {
              background: hexToRgba(color, 0.12),
              color,
              boxShadow: `inset 0 0 0 1px ${hexToRgba(color, 0.28)}`,
            }
      }
      data-env={env ?? 'none'}
    >
      <span
        className={cn('rounded-full', size === 'sm' ? 'size-1.5' : 'size-1')}
        style={{ background: solid ? readableText(color) : color }}
      />
      {label}
    </span>
  );
}
