import { RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { MarkerPreview } from '@/components/MarkerPreview';
import { StylePicker } from '@/components/StylePicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, SectionTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  CORNER_KEYS,
  ENV_KEYS,
  ENV_META,
  OPACITY_KEYS,
  cornerLabel,
  envLabel,
  styleDetail,
  styleLabel,
} from '@/lib/envs';
import { useT } from '@/lib/i18n-react';
import type { Corner, EnvKey, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';

const SAMPLE_HOST: Record<EnvKey, string> = {
  production: 'admin.example.com',
  staging: 'admin.test.example.com',
  development: 'dev.example.com',
  local: 'localhost:3000',
};

export function AppearanceSection({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const t = useT();
  const [previewEnv, setPreviewEnv] = useState<EnvKey>('production');
  const previewColor = settings.colors[previewEnv];
  const previewLabel = envLabel(settings.labels, previewEnv);
  const isPill = settings.style === 'pill';

  return (
    <div className="space-y-6">
      <SectionTitle title={t('appearance.title')} description={t('appearance.desc')} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('appearance.style')}</CardTitle>
              <CardDescription>{t('appearance.styleDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <StylePicker
                value={settings.style}
                color={settings.colors[previewEnv]}
                columns={2}
                onChange={(style) => onChange({ style })}
              />

              <Field
                  label={t('appearance.position')}
                  hint={isPill ? t('appearance.positionDrag') : t('appearance.positionHint')}
                >
                  <div className="flex gap-1.5">
                    <Select
                      value={settings.pillPos ? 'custom' : settings.corner}
                      disabled={!isPill}
                      onChange={(e) => {
                        if (e.target.value === 'custom') return;
                        onChange({ corner: e.target.value as Corner, pillPos: null });
                      }}
                    >
                      {CORNER_KEYS.map((corner) => (
                        <option key={corner} value={corner}>
                          {cornerLabel(corner)}
                        </option>
                      ))}
                      {settings.pillPos ? (
                        <option value="custom">{t('appearance.custom')}</option>
                      ) : null}
                    </Select>
                    {settings.pillPos ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        onClick={() => onChange({ pillPos: null })}
                        title={t('appearance.clearPos')}
                      >
                        <RotateCcw className="size-3.5" />
                      </Button>
                    ) : null}
                  </div>
                </Field>

              <div className="space-y-2">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <span className="text-[13px] leading-none font-medium">
                    {t('appearance.opacity')}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {t('appearance.opacityNote')}
                  </span>
                </div>
                <div className="space-y-2 rounded-lg border bg-card/40 px-3 py-2.5">
                  {OPACITY_KEYS.map((key) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-[11px] text-muted-foreground">
                        {styleLabel(key)}
                      </span>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={settings.opacity[key]}
                        onChange={(e) =>
                          onChange({
                            opacity: { ...settings.opacity, [key]: Number(e.target.value) },
                          })
                        }
                        className="range flex-1"
                        aria-label={`${styleLabel(key)} ${t('appearance.opacity')}`}
                      />
                      <span className="w-9 shrink-0 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                        {settings.opacity[key]}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('appearance.names')}</CardTitle>
              <CardDescription>{t('appearance.namesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {ENV_KEYS.map((key) => {
                const meta = ENV_META[key];
                const isDefaultColor = settings.colors[key] === meta.color;
                const custom = settings.labels[key]?.trim();
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2.5 rounded-lg border bg-card/50 p-2"
                  >
                    <label
                      className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md ring-1 ring-black/10 ring-inset"
                      style={{ background: settings.colors[key] }}
                      title={t('appearance.pickColor')}
                    >
                      <input
                        type="color"
                        value={settings.colors[key]}
                        onChange={(e) =>
                          onChange({ colors: { ...settings.colors, [key]: e.target.value } })
                        }
                        className="absolute inset-0 size-full cursor-pointer opacity-0"
                      />
                    </label>

                    <Input
                      value={custom ?? ''}
                      placeholder={envLabel({}, key)}
                      maxLength={12}
                      onChange={(e) => {
                        const value = e.target.value;
                        const next = { ...settings.labels };
                        if (value.trim()) next[key] = value;
                        else delete next[key];
                        onChange({ labels: next });
                      }}
                      className="h-8 flex-1 border-transparent bg-transparent px-2 shadow-none focus-visible:border-input"
                    />

                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-widest"
                      style={{ background: `${settings.colors[key]}1f`, color: settings.colors[key] }}
                    >
                      {meta.code}
                    </span>

                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="shrink-0 text-muted-foreground"
                      disabled={!custom && isDefaultColor}
                      onClick={() =>
                        onChange({ colors: { ...settings.colors, [key]: meta.color } })
                      }
                      title={t('appearance.restore')}
                    >
                      <RotateCcw className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <MarkerPreview
            style={settings.style}
            corner={settings.corner}
            pillPos={settings.pillPos}
            opacity={settings.opacity}
            showHost={settings.showHost}
            label={previewLabel}
            code={ENV_META[previewEnv].code}
            color={previewColor}
            host={SAMPLE_HOST[previewEnv]}
          />
          <div className="flex items-center gap-1.5">
            <span className="mr-auto text-[11px] text-muted-foreground">
              {t('appearance.preview')}
            </span>
            {ENV_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setPreviewEnv(key)}
                aria-label={envLabel(settings.labels, key)}
                className={cn(
                  'size-4 rounded-full transition-all',
                  previewEnv === key
                    ? 'ring-2 ring-foreground/25 ring-offset-2 ring-offset-background'
                    : 'opacity-50 hover:opacity-100',
                )}
                style={{ background: settings.colors[key] }}
              />
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground text-pretty">
            {styleDetail(settings.style)}
          </p>
        </div>
      </div>
    </div>
  );
}
