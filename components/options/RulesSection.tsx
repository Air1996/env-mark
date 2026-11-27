import { CircleCheck, Plus, Trash, TriangleExclamationPoint } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EnvChip } from '@/components/EnvChip';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, SectionTitle } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ENV_KEYS, MATCH_TYPES, envLabel, matchLabel, matchPlaceholder, sourceLabel } from '@/lib/envs';
import { useT } from '@/lib/i18n-react';
import { resolveEnv, uid } from '@/lib/resolve';
import type { EnvKey, Rule, Settings } from '@/lib/types';

const EXAMPLES: { pattern: string; env: EnvKey; labelKey: 'rules.ex1' | 'rules.ex2' | 'rules.ex3' }[] =
  [
    { pattern: '*.test.example.com', env: 'staging', labelKey: 'rules.ex1' },
    { pattern: '*.staging.example.com', env: 'staging', labelKey: 'rules.ex2' },
    { pattern: 'admin.example.com', env: 'production', labelKey: 'rules.ex3' },
  ];

export function RulesSection({
  settings,
  rules,
  onRulesChange,
}: {
  settings: Settings;
  rules: Rule[];
  onRulesChange: (next: Rule[]) => void;
}) {
  const t = useT();
  const [testUrl, setTestUrl] = useState('https://admin.test.example.com/login');

  const testResult = useMemo(() => {
    if (!testUrl.trim()) return null;
    try {
      const url = new URL(testUrl.trim());
      return resolveEnv({ url, rules, settings, overrides: {} });
    } catch {
      return null;
    }
  }, [testUrl, rules, settings]);

  const patch = (id: string, next: Partial<Rule>) =>
    onRulesChange(rules.map((r) => (r.id === id ? { ...r, ...next } : r)));

  const addRule = (seed?: Partial<Rule>) =>
    onRulesChange([
      {
        id: uid('rule'),
        pattern: '',
        matchType: 'glob',
        env: 'staging',
        enabled: true,
        ...seed,
      },
      ...rules,
    ]);

  const testDetail = testResult?.detailKey ? t(testResult.detailKey) : testResult?.detail;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SectionTitle title={t('rules.title')} description={t('rules.desc')} />
        <Button size="sm" onClick={() => addRule()}>
          <Plus className="size-3.5" />
          {t('rules.add')}
        </Button>
      </div>

      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <p className="text-[13px] font-medium">{t('rules.empty')}</p>
            <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
              {t('rules.emptyDesc')}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.pattern}
                  type="button"
                  onClick={() => addRule({ pattern: ex.pattern, env: ex.env })}
                  className="rounded-full border px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/25 hover:bg-accent hover:text-foreground"
                >
                  {ex.pattern}
                  <span className="ml-1.5 font-sans opacity-70">{t(ex.labelKey)}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {rules.map((rule, index) => (
            <div
              key={rule.id}
              className="group rounded-lg border bg-card px-3 py-2.5 transition-colors hover:border-foreground/15"
            >
              <div className="flex items-center gap-2.5">
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={(v) => patch(rule.id, { enabled: v })}
                  aria-label={t('rules.enable')}
                />
                <Input
                  value={rule.pattern}
                  autoFocus={index === 0 && rule.pattern === ''}
                  placeholder={matchPlaceholder(rule.matchType)}
                  onChange={(e) => patch(rule.id, { pattern: e.target.value })}
                  className="h-8 flex-1 border-transparent bg-transparent px-2 font-mono text-xs shadow-none hover:bg-muted/50 focus-visible:border-input focus-visible:bg-transparent"
                />
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="shrink-0 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100 hover:text-destructive"
                  onClick={() => onRulesChange(rules.filter((r) => r.id !== rule.id))}
                  title={t('rules.remove')}
                >
                  <Trash className="size-3.5" />
                </Button>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 pl-[44px]">
                <Select
                  value={rule.matchType}
                  onChange={(e) =>
                    patch(rule.id, { matchType: e.target.value as Rule['matchType'] })
                  }
                  className="w-[118px]"
                >
                  {MATCH_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {matchLabel(type)}
                    </option>
                  ))}
                </Select>
                <Select
                  value={rule.env}
                  onChange={(e) => patch(rule.id, { env: e.target.value as EnvKey })}
                  className="w-[132px]"
                >
                  {ENV_KEYS.map((key) => (
                    <option key={key} value={key}>
                      {envLabel(settings.labels, key)}
                    </option>
                  ))}
                </Select>
                <Input
                  value={rule.note ?? ''}
                  placeholder={t('rules.note')}
                  onChange={(e) => patch(rule.id, { note: e.target.value })}
                  className="h-8 min-w-[120px] flex-1 text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('rules.try')}</CardTitle>
          <CardDescription>{t('rules.tryDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field label={t('rules.url')}>
            <Input
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="https://admin.test.example.com/login"
              className="font-mono text-xs"
            />
          </Field>

          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
            {testResult?.env ? (
              <>
                <CircleCheck className="size-3.5 shrink-0 text-emerald-500" />
                <EnvChip
                  env={testResult.env}
                  label={envLabel(settings.labels, testResult.env)}
                  color={settings.colors[testResult.env]}
                />
                <span className="text-[11px] text-muted-foreground">
                  {sourceLabel(testResult.source)}
                  {testDetail && testResult.source !== 'manual' ? ` · ${testDetail}` : ''}
                </span>
              </>
            ) : testResult ? (
              <>
                <TriangleExclamationPoint className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('rules.noMatch')}</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">{t('rules.invalid')}</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
