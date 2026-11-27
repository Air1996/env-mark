import { browser } from '#imports';
import {
  ArrowUpRight,
  Check,
  Eye,
  EyeOff,
  Plus,
  Settings as SettingsIcon,
  TriangleExclamationPoint,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EnvChip } from '@/components/EnvChip';
import { Logo } from '@/components/Logo';
import { StylePicker } from '@/components/StylePicker';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ENV_KEYS, envColor, envLabel, envShortLabel, sourceLabel } from '@/lib/envs';
import { useT } from '@/lib/i18n-react';
import {
  askPageState,
  refreshPageState,
  togglePageMarker,
  UNSUPPORTED_STATE,
  type PageState,
} from '@/lib/messages';
import { uid } from '@/lib/resolve';
import {
  DEFAULT_SETTINGS,
  getOverrides,
  getRules,
  getSettings,
  patchSettings,
  setOverride,
  setRules,
} from '@/lib/storage';
import type { EnvKey, MarkerStyle, Overrides, Rule, Settings } from '@/lib/types';
import { cn, hexToRgba } from '@/lib/utils';

export function App() {
  const t = useT();
  const [tabId, setTabId] = useState<number | null>(null);
  const [page, setPage] = useState<PageState | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [rules, setLocalRules] = useState<Rule[]>([]);
  const [overrides, setLocalOverrides] = useState<Overrides>({});
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [s, r, o] = await Promise.all([getSettings(), getRules(), getOverrides()]);
      setSettings(s);
      setLocalRules(r);
      setLocalOverrides(o);
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (tab?.id == null) {
        setPage(UNSUPPORTED_STATE);
        return;
      }
      setTabId(tab.id);
      setPage(await askPageState(tab.id));
    })();
  }, []);

  const host = page?.host ?? '';
  const env = page?.env ?? null;
  const manual = page?.source === 'manual';
  const forceOff = Boolean(host) && overrides[host] === 'none';
  const color = env ? envColor(settings.colors, env) : '#71717a';

  const showFlash = useCallback((text: string) => {
    setFlash(text);
    window.setTimeout(() => setFlash(null), 1600);
  }, []);

  const syncPage = useCallback(async (id: number | null) => {
    if (id == null) return;
    setPage(await refreshPageState(id));
  }, []);

  async function pick(next: EnvKey | 'none' | null) {
    if (!host) return;
    await setOverride(host, next);
    setLocalOverrides(await getOverrides());
    await syncPage(tabId);
  }

  async function updateSettings(patch: Partial<Settings>) {
    const next = await patchSettings(patch);
    setSettings(next);
    await syncPage(tabId);
  }

  async function saveRule() {
    if (!host || !env) return;
    const existing = rules.find((r) => r.pattern === host && r.matchType === 'glob');
    const next = existing
      ? rules.map((r) => (r.id === existing.id ? { ...r, env, enabled: true } : r))
      : [
          {
            id: uid('rule'),
            pattern: host,
            matchType: 'glob' as const,
            env,
            enabled: true,
            note: t('popup.savedFromPopup'),
          },
          // 放在最前面，避免被更宽泛的规则抢先命中
          ...rules,
        ];
    await setRules(next);
    setLocalRules(next);
    if (manual) {
      await setOverride(host, null);
      setLocalOverrides(await getOverrides());
    }
    await syncPage(tabId);
    showFlash(t('popup.saved'));
  }

  async function toggleHidden() {
    if (tabId == null) return;
    setPage(await togglePageMarker(tabId));
  }

  const openOptions = () => void browser.runtime.openOptionsPage();

  return (
    <div className="animate-in-soft flex w-[360px] flex-col bg-background text-foreground">
      {/* 顶栏 */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b px-3">
        <Logo size={18} />
        <span className="text-[13px] font-semibold tracking-tight">EnvMark</span>
        <span className="ml-1 text-[10px] font-medium text-muted-foreground">
          {t('app.tagline')}
        </span>
        <Button
          size="icon-sm"
          variant="ghost"
          className="ml-auto text-muted-foreground"
          onClick={openOptions}
          title={t('popup.openSettings')}
        >
          <SettingsIcon className="size-3.5" />
        </Button>
      </header>

      <div className="space-y-4 p-3">
        {/* 当前站点 */}
        {page === null ? (
          <div className="h-[72px] animate-pulse rounded-lg border bg-muted/40" />
        ) : !page.supported ? (
          <div className="rounded-lg border border-dashed px-3 py-4 text-center">
            <TriangleExclamationPoint className="mx-auto size-4 text-muted-foreground" />
            <p className="mt-2 text-xs font-medium">{t('popup.unsupportedTitle')}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {t('popup.unsupportedDesc')}
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card px-3 py-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="min-w-0 flex-1 truncate font-mono text-[12px] leading-none">
                {page.host}
              </span>
              {env ? (
                <EnvChip env={env} label={envLabel(settings.labels, env)} color={color} />
              ) : (
                <span className="rounded-full border border-dashed px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {t('popup.unknown')}
                </span>
              )}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-medium">{sourceLabel(page.source ?? 'none')}</span>
              {page.detail && page.source !== 'manual' ? (
                <>
                  <span className="text-border">·</span>
                  <span className="max-w-[190px] truncate font-mono text-[10px]">
                    {page.detail}
                  </span>
                </>
              ) : null}
            </div>
            {page.hidden ? (
              <button
                type="button"
                onClick={toggleHidden}
                className="mt-2 flex w-full items-center gap-1.5 rounded-md bg-muted/70 px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted"
              >
                <EyeOff className="size-3" />
                {t('popup.hidden')}
                <span className="ml-auto font-medium text-foreground">{t('popup.restore')}</span>
              </button>
            ) : page.env && page.marked === false && page.env === 'production' ? (
              <div className="mt-2 flex items-start gap-1.5 rounded-md bg-muted/70 px-2 py-1.5 text-[11px] text-muted-foreground">
                <Eye className="mt-px size-3 shrink-0" />
                {t('popup.prodOff')}
              </div>
            ) : null}
          </div>
        )}

        {/* 手动指定 */}
        {page?.supported ? (
          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                {t('popup.specify')}
              </h3>
              <span className="text-[10px] text-muted-foreground/70">{t('popup.onlyHost')}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {ENV_KEYS.map((key) => {
                const active = env === key && manual;
                const c = envColor(settings.colors, key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => pick(key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border py-2 transition-all outline-none',
                      'focus-visible:ring-[3px] focus-visible:ring-ring/30',
                      active
                        ? 'border-transparent'
                        : 'border-border hover:border-foreground/20 hover:bg-accent/60',
                    )}
                    style={
                      active
                        ? {
                            background: hexToRgba(c, 0.12),
                            boxShadow: `inset 0 0 0 1px ${hexToRgba(c, 0.45)}`,
                          }
                        : undefined
                    }
                  >
                    <span className="size-2 rounded-full" style={{ background: c }} />
                    <span className="text-[11px] leading-none font-medium">
                      {envShortLabel(settings.labels, key)}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <Button
                size="xs"
                variant={!manual && !forceOff ? 'secondary' : 'outline'}
                className={cn(!manual && !forceOff ? 'text-foreground' : 'text-muted-foreground')}
                onClick={() => pick(null)}
              >
                {!manual && !forceOff ? <Check className="size-3" /> : null}
                {t('popup.follow')}
              </Button>
              <Button
                size="xs"
                variant={forceOff ? 'secondary' : 'outline'}
                className={cn(forceOff ? 'text-foreground' : 'text-muted-foreground')}
                onClick={() => pick('none')}
              >
                {forceOff ? <Check className="size-3" /> : null}
                {t('popup.dontMark')}
              </Button>
            </div>
          </section>
        ) : null}

        {/* 样式 */}
        <section className="space-y-2">
          <h3 className="text-[11px] font-semibold tracking-wide text-muted-foreground">
            {t('popup.style')}
          </h3>
          <StylePicker
            value={settings.style}
            color={color}
            columns={4}
            showDesc={false}
            onChange={(next: MarkerStyle) => void updateSettings({ style: next })}
          />
        </section>

        {/* 开关 */}
        <section className="space-y-0.5 border-t pt-2">
          <CompactToggle
            label={t('popup.showHost')}
            checked={settings.showHost}
            onChange={(v) => void updateSettings({ showHost: v })}
          />
          <CompactToggle
            label={t('popup.markProd')}
            checked={settings.markProduction}
            onChange={(v) => void updateSettings({ markProduction: v })}
          />
        </section>
      </div>

      {/* 底栏 */}
      <footer className="flex shrink-0 items-center gap-2 border-t px-3 py-2.5">
        <Button size="sm" className="flex-1" onClick={saveRule} disabled={!env}>
          {flash ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
          {flash ?? t('popup.saveRule')}
        </Button>
        <Button size="sm" variant="ghost" onClick={openOptions} className="text-muted-foreground">
          {t('popup.allSettings')}
          <ArrowUpRight className="size-3.5" />
        </Button>
      </footer>
    </div>
  );
}

function CompactToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-[12px] text-foreground/90">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
