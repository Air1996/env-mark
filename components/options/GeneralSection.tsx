import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingRow, SectionTitle } from '@/components/ui/field';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useT } from '@/lib/i18n-react';
import type { LocalePref, MessageKey } from '@/lib/i18n';
import type { Settings } from '@/lib/types';

const FLOW: { title: MessageKey; desc: MessageKey }[] = [
  { title: 'general.flow1', desc: 'general.flow1Desc' },
  { title: 'general.flow2', desc: 'general.flow2Desc' },
  { title: 'general.flow3', desc: 'general.flow3Desc' },
  { title: 'general.flow4', desc: 'general.flow4Desc' },
];

const LANGUAGES: { value: LocalePref; label: MessageKey }[] = [
  { value: 'auto', label: 'general.langAuto' },
  { value: 'zh', label: 'general.langZh' },
  { value: 'en', label: 'general.langEn' },
];

export function GeneralSection({
  settings,
  onChange,
}: {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}) {
  const t = useT();

  return (
    <div className="space-y-6">
      <SectionTitle title={t('general.title')} description={t('general.desc')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('general.global')}</CardTitle>
          <CardDescription>{t('general.globalDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border py-1">
          <SettingRow title={t('general.language')} description={t('general.languageDesc')}>
            <Select
              value={settings.locale}
              onChange={(e) => onChange({ locale: e.target.value as LocalePref })}
              className="w-[148px]"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {t(lang.label)}
                </option>
              ))}
            </Select>
          </SettingRow>
          <SettingRow title={t('general.heuristic')} description={t('general.heuristicDesc')}>
            <Switch
              checked={settings.heuristic}
              onCheckedChange={(v) => onChange({ heuristic: v })}
              aria-label={t('general.heuristic')}
            />
          </SettingRow>
          <SettingRow title={t('general.markProd')} description={t('general.markProdDesc')}>
            <Switch
              checked={settings.markProduction}
              onCheckedChange={(v) => onChange({ markProduction: v })}
              aria-label={t('general.markProd')}
            />
          </SettingRow>
          <SettingRow title={t('general.showHost')} description={t('general.showHostDesc')}>
            <Switch
              checked={settings.showHost}
              onCheckedChange={(v) => onChange({ showHost: v })}
              aria-label={t('general.showHost')}
            />
          </SettingRow>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('general.order')}</CardTitle>
          <CardDescription>{t('general.orderDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {FLOW.map((item, i) => (
            <div key={item.title} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border bg-muted/60 font-mono text-[10px] font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                {i < FLOW.length - 1 ? <span className="my-1 w-px flex-1 bg-border" /> : null}
              </div>
              <div className="pb-1">
                <div className="text-[13px] font-medium">{t(item.title)}</div>
                <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {t(item.desc)}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
