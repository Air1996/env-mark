import { browser } from '#imports';
import { Download, Keyboard, RotateCcw, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionTitle } from '@/components/ui/field';
import { useT } from '@/lib/i18n-react';
import type { Rule, Settings } from '@/lib/types';

export function DataSection({
  settings,
  rules,
  onApply,
  onReset,
  onToast,
}: {
  settings: Settings;
  rules: Rule[];
  onApply: (settings: Settings, rules: Rule[]) => void;
  onReset: () => void;
  onToast: (message: string) => void;
}) {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function exportConfig() {
    const payload = {
      app: 'envmark',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      rules,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `envmark-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onToast(t('data.exported'));
  }

  async function importConfig(file: File) {
    try {
      const data = JSON.parse(await file.text()) as {
        settings?: Settings;
        rules?: Rule[];
      };
      if (!data || typeof data !== 'object' || (!data.settings && !data.rules)) {
        throw new Error('invalid');
      }
      onApply(
        { ...settings, ...(data.settings ?? {}) },
        Array.isArray(data.rules) ? data.rules : rules,
      );
      onToast(t('data.imported'));
    } catch {
      onToast(t('data.importFail'));
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle title={t('data.title')} description={t('data.desc')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('data.backup')}</CardTitle>
          <CardDescription>{t('data.backupDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportConfig}>
            <Download className="size-3.5" />
            {t('data.export')}
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-3.5" />
            {t('data.import')}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importConfig(file);
              e.target.value = '';
            }}
          />
          <span className="mx-1 h-8 w-px bg-border" />
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('data.resetConfirm')}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onReset();
                  setConfirmReset(false);
                  onToast(t('data.resetDone'));
                }}
              >
                {t('data.resetYes')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmReset(false)}>
                {t('data.cancel')}
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmReset(true)}
            >
              <RotateCcw className="size-3.5" />
              {t('data.reset')}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('data.shortcut')}</CardTitle>
          <CardDescription>{t('data.shortcutDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Keyboard className="size-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
              {['Alt', 'Shift', 'E'].map((key) => (
                <kbd
                  key={key}
                  className="rounded-md border border-b-2 bg-muted/60 px-2 py-1 font-mono text-[11px] font-medium text-foreground"
                >
                  {key}
                </kbd>
              ))}
            </div>
            <span className="text-xs text-muted-foreground">{t('data.shortcutAction')}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {t('data.shortcutHintBefore')}{' '}
            <code className="font-mono">chrome://extensions/shortcuts</code>
            {t('data.shortcutHintAfter')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('data.about')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>
            EnvMark v{browser.runtime.getManifest().version} · {t('data.aboutVersion')}
          </p>
          <p>{t('data.aboutPrivacy')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
