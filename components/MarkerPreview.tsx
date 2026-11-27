import type { CSSProperties } from 'react';
import { cn, readableText } from '@/lib/utils';
import type { Corner, MarkerStyle, OpacityKey, PillPosition } from '@/lib/types';

const CORNER: Record<Corner, string> = {
  'top-left': 'top-2 left-2',
  'top-right': 'top-2 right-2',
  'bottom-left': 'bottom-2 left-2',
  'bottom-right': 'bottom-2 right-2',
};

/** 迷你标签，用于预览 */
function MiniPill({
  label,
  code,
  color,
  host,
  showHost,
  className,
  style,
}: {
  label: string;
  code?: string;
  color: string;
  host: string;
  showHost: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const fg = readableText(color);
  return (
    <div
      className={cn(
        'absolute flex h-[18px] items-center gap-1 rounded-full px-1.5 whitespace-nowrap shadow-sm',
        className,
      )}
      style={{ background: color, color: fg, ...style }}
    >
      <span className="size-1 rounded-full" style={{ background: fg, opacity: 0.9 }} />
      <span className="text-[9px] leading-none font-bold">{label}</span>
      {code ? (
        <span
          className="rounded-[3px] px-1 py-px text-[7px] leading-none font-extrabold tracking-wider"
          style={{ background: 'rgba(0,0,0,.22)' }}
        >
          {code}
        </span>
      ) : null}
      {showHost ? (
        <span className="font-mono text-[8px] leading-none opacity-80">{host}</span>
      ) : null}
    </div>
  );
}

function MiniDot({ fg }: { fg: string }) {
  return <span className="size-1.5 rounded-full" style={{ background: fg }} />;
}

export function MarkerPreview({
  style,
  corner,
  pillPos,
  opacity,
  showHost,
  label,
  code,
  color,
  host,
  className,
}: {
  style: MarkerStyle;
  corner: Corner;
  pillPos: PillPosition | null;
  opacity: Record<OpacityKey, number>;
  showHost: boolean;
  label: string;
  code: string;
  color: string;
  host: string;
  className?: string;
}) {
  const fg = readableText(color);
  const alpha = (style: OpacityKey) => opacity[style] / 100;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border bg-background shadow-sm select-none',
        className,
      )}
    >
      {/* 浏览器窗口装饰 */}
      <div className="flex h-7 items-center gap-1.5 border-b bg-muted/50 px-2.5">
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <span className="size-1.5 rounded-full bg-foreground/15" />
        <div className="mx-auto flex h-4 w-32 items-center rounded-full border bg-background px-1.5">
          <span className="truncate font-mono text-[7px] text-muted-foreground">{host}</span>
        </div>
      </div>

      {/* 伪页面内容 */}
      <div className="relative h-[150px] overflow-hidden">
        <div className="space-y-2 p-3.5">
          <div className="h-1.5 w-16 rounded-full bg-foreground/10" />
          <div className="h-1.5 w-28 rounded-full bg-foreground/[0.07]" />
          <div className="h-1.5 w-24 rounded-full bg-foreground/[0.07]" />
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <div className="h-8 rounded border bg-muted/40" />
            <div className="h-8 rounded border bg-muted/40" />
            <div className="h-8 rounded border bg-muted/40" />
          </div>
          <div className="h-4 w-14 rounded bg-foreground/10" />
        </div>

        {/* 标记层 */}
        <div className="pointer-events-none absolute inset-0">
          {style === 'frame' ? (
            <>
              <div
                className="absolute inset-0 border-[3px]"
                style={{ borderColor: color, opacity: alpha('frame') }}
              />
              <MiniPill
                label={label}
                color={color}
                host={host}
                showHost={showHost}
                className="top-2 left-1/2 -translate-x-1/2"
                style={{ opacity: alpha('frame') }}
              />
            </>
          ) : null}

          {style === 'strip' ? (
            <div
              className="absolute inset-x-0 top-0 flex h-[20px] items-center gap-1.5 px-2"
              style={{ background: color, color: fg, opacity: alpha('strip') }}
            >
              <MiniDot fg={fg} />
              <span className="text-[9px] font-bold">{label}</span>
              <span
                className="rounded-[3px] px-1 py-px text-[7px] font-extrabold tracking-wider"
                style={{ background: 'rgba(0,0,0,.22)' }}
              >
                {code}
              </span>
              {showHost ? (
                <span className="truncate font-mono text-[8px] opacity-80">{host}</span>
              ) : null}
              <span className="ml-auto text-[6px] font-extrabold tracking-[0.18em] opacity-50">
                ENVMARK
              </span>
            </div>
          ) : null}

          {style === 'pill' ? (
            <MiniPill
              label={label}
              code={code}
              color={color}
              host={host}
              showHost={showHost}
              className={pillPos ? undefined : CORNER[corner]}
              style={
                pillPos
                  ? {
                      left: `${pillPos.x * 100}%`,
                      top: `${pillPos.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }
                  : undefined
              }
            />
          ) : null}

          {style === 'watermark' ? (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <span
                className="text-[34px] font-black whitespace-nowrap"
                style={{ color, opacity: alpha('watermark'), transform: 'rotate(-16deg)' }}
              >
                {label}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
