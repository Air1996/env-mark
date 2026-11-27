import { browser } from '#imports';
import { Database, ListFilter, Palette, SlidersHorizontal } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/Logo';
import { AppearanceSection } from '@/components/options/AppearanceSection';
import { DataSection } from '@/components/options/DataSection';
import { GeneralSection } from '@/components/options/GeneralSection';
import { RulesSection } from '@/components/options/RulesSection';
import { Badge } from '@/components/ui/badge';
import { setLocale } from '@/lib/i18n';
import { useT } from '@/lib/i18n-react';
import { DEFAULT_SETTINGS, getRules, getSettings, rulesItem, settingsItem } from '@/lib/storage';
import type { MessageKey } from '@/lib/i18n';
import type { Rule, Settings } from '@/lib/types';
import { cn } from '@/lib/utils';

const SECTIONS: { id: string; labelKey: MessageKey; icon: typeof Palette }[] = [
  { id: 'general', labelKey: 'nav.general', icon: SlidersHorizontal },
  { id: 'appearance', labelKey: 'nav.appearance', icon: Palette },
  { id: 'rules', labelKey: 'nav.rules', icon: ListFilter },
  { id: 'data', labelKey: 'nav.data', icon: Database },
];

export function App() {
  const t = useT();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [active, setActive] = useState<string>('general');
  const dirtySettings = useRef(false);
  const dirtyRules = useRef(false);

  useEffect(() => {
    (async () => {
      const [s, r] = await Promise.all([getSettings(), getRules()]);
      setSettings(s);
      setRules(r);
    })();
  }, []);

  // 语言切换要立刻作用到当前页面，不能等防抖写盘
  useEffect(() => {
    if (settings) setLocale(settings.locale);
  }, [settings?.locale]);

  useEffect(() => {
    if (!settings || !dirtySettings.current) return;
    const timer = window.setTimeout(() => void settingsItem.setValue(settings), 220);
    return () => window.clearTimeout(timer);
  }, [settings]);

  useEffect(() => {
    if (!dirtyRules.current) return;
    const timer = window.setTimeout(() => void rulesItem.setValue(rules), 220);
    return () => window.clearTimeout(timer);
  }, [rules]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-72px 0px -66% 0px' },
    );
    for (const section of SECTIONS) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [settings !== null]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const updateSettings = (patch: Partial<Settings>) => {
    dirtySettings.current = true;
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateRules = (next: Rule[]) => {
    dirtyRules.current = true;
    setRules(next);
  };

  const resetAll = () => {
    dirtySettings.current = true;
    dirtyRules.current = true;
    setSettings(DEFAULT_SETTINGS);
    setRules([]);
    void settingsItem.setValue(DEFAULT_SETTINGS);
    void rulesItem.setValue([]);
  };

  const applyImport = (nextSettings: Settings, nextRules: Rule[]) => {
    dirtySettings.current = true;
    dirtyRules.current = true;
    setSettings(nextSettings);
    setRules(nextRules);
    void settingsItem.setValue(nextSettings);
    void rulesItem.setValue(nextRules);
  };

  if (!settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-foreground/25" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2.5 px-6">
          <Logo size={22} />
          <span className="text-sm font-semibold tracking-tight">EnvMark</span>
          <Badge>v{browser.runtime.getManifest().version}</Badge>
          <span className="ml-1 hidden text-xs text-muted-foreground sm:block">
            {t('app.slogan')}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="lg:grid lg:grid-cols-[160px_minmax(0,1fr)] lg:gap-10">
          <nav className="hidden lg:block">
            <div className="sticky top-20 space-y-0.5">
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={() => setActive(section.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[13px] transition-colors',
                      active === section.id
                        ? 'bg-accent font-medium text-accent-foreground'
                        : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-3.5" />
                    {t(section.labelKey)}
                  </a>
                );
              })}
            </div>
          </nav>

          <main className="min-w-0 space-y-14 pb-28">
            <section id="general" className="scroll-mt-20">
              <GeneralSection settings={settings} onChange={updateSettings} />
            </section>
            <section id="appearance" className="scroll-mt-20">
              <AppearanceSection settings={settings} onChange={updateSettings} />
            </section>
            <section id="rules" className="scroll-mt-20">
              <RulesSection settings={settings} rules={rules} onRulesChange={updateRules} />
            </section>
            <section id="data" className="scroll-mt-20">
              <DataSection
                settings={settings}
                rules={rules}
                onApply={applyImport}
                onReset={resetAll}
                onToast={setToast}
              />
            </section>
          </main>
        </div>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="animate-in-soft rounded-lg border bg-popover px-3.5 py-2 text-xs font-medium text-popover-foreground shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}
    </div>
  );
}
