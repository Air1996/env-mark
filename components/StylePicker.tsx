import { STYLE_KEYS, styleDesc, styleLabel } from '@/lib/envs';
import { useT } from '@/lib/i18n-react';
import type { MarkerStyle } from '@/lib/types';
import { cn } from '@/lib/utils';

function Thumb({ style, color }: { style: MarkerStyle; color: string }) {
  return (
    <div className="relative h-6 w-9 shrink-0 overflow-hidden rounded-[3px] border bg-background">
      {style === 'frame' ? (
        <div className="absolute inset-0 border-2" style={{ borderColor: color }} />
      ) : null}
      {style === 'strip' ? (
        <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: color }} />
      ) : null}
      {style === 'pill' ? (
        <div
          className="absolute top-1 right-1 h-1.5 w-4 rounded-full"
          style={{ background: color }}
        />
      ) : null}
      {style === 'watermark' ? (
        <div
          className="absolute inset-0 flex items-center justify-center text-[8px] font-black"
          style={{ color, opacity: 0.5, transform: 'rotate(-16deg)' }}
        >
          ENV
        </div>
      ) : null}
    </div>
  );
}

export function StylePicker({
  value,
  color,
  onChange,
  columns = 2,
  showDesc = true,
  className,
}: {
  value: MarkerStyle;
  color: string;
  onChange: (next: MarkerStyle) => void;
  columns?: 2 | 4;
  showDesc?: boolean;
  className?: string;
}) {
  const t = useT();
  return (
    <div
      className={cn('grid gap-2', columns === 4 ? 'grid-cols-4' : 'grid-cols-2', className)}
      role="radiogroup"
      aria-label={t('appearance.style')}
    >
      {STYLE_KEYS.map((style) => {
        const active = style === value;
        return (
          <button
            key={style}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(style)}
            className={cn(
              'group flex items-center gap-2 rounded-lg border text-left transition-all outline-none',
              columns === 4 ? 'flex-col gap-1.5 px-1 py-2' : 'p-2.5',
              'focus-visible:ring-[3px] focus-visible:ring-ring/30',
              active
                ? 'border-foreground/25 bg-accent shadow-sm'
                : 'border-border hover:border-foreground/20 hover:bg-accent/50',
            )}
          >
            <div style={{ opacity: active ? 1 : 0.45 }}>
              <Thumb style={style} color={color} />
            </div>
            <div className={cn('min-w-0', columns === 4 && 'text-center')}>
              <div className="text-xs leading-none font-medium">{styleLabel(style)}</div>
              {showDesc && columns === 2 ? (
                <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  {styleDesc(style)}
                </div>
              ) : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}
