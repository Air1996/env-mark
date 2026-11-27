import { storage } from '#imports';
import { ENV_META } from './envs';
import { setLocale, ZH_ENV_LABELS } from './i18n';
import type { EnvKey, OpacityKey, Overrides, Rule, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  locale: 'auto',
  style: 'frame',
  corner: 'top-right',
  pillPos: null,
  opacity: { frame: 100, strip: 100, watermark: 20 },
  showHost: true,
  heuristic: true,
  markProduction: true,
  labels: {},
  colors: {
    production: ENV_META.production.color,
    staging: ENV_META.staging.color,
    development: ENV_META.development.color,
    local: ENV_META.local.color,
  },
};

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(n)));

/**
 * 旧版本的 opacity 是一个数字，作用于所有样式；水印当时内部还乘了 0.16，
 * 迁移时按同等观感折算成 20% 左右。
 */
function migrateOpacity(raw: unknown): Record<OpacityKey, number> {
  if (typeof raw === 'number') {
    const v = clamp(raw, 5, 100);
    return { frame: v, strip: v, watermark: clamp(v * 0.2, 5, 100) };
  }
  const saved = (raw ?? {}) as Partial<Record<OpacityKey, number>>;
  return {
    frame: clamp(saved.frame ?? 100, 5, 100),
    strip: clamp(saved.strip ?? 100, 5, 100),
    watermark: clamp(saved.watermark ?? 20, 5, 100),
  };
}

/**
 * labels 现在是稀疏覆盖：只存用户真正改过的名称。
 * 旧版本会把内置默认名称一起存下来，迁移时丢掉与默认文案相同的项，
 * 这样切换语言时标记里的名称才会跟着变。
 */
function migrateLabels(raw: unknown): Partial<Record<EnvKey, string>> {
  const saved = (raw ?? {}) as Partial<Record<EnvKey, string>>;
  const out: Partial<Record<EnvKey, string>> = {};
  for (const key of Object.keys(ENV_META) as EnvKey[]) {
    const value = saved[key]?.trim();
    if (value && value !== ZH_ENV_LABELS[key]) out[key] = value;
  }
  return out;
}

export const settingsItem = storage.defineItem<Settings>('local:settings', {
  fallback: DEFAULT_SETTINGS,
});

export const rulesItem = storage.defineItem<Rule[]>('local:rules', {
  fallback: [],
});

export const overridesItem = storage.defineItem<Overrides>('local:overrides', {
  fallback: {},
});

export async function getSettings(): Promise<Settings> {
  const saved = ((await settingsItem.getValue()) ?? {}) as Partial<Settings>;
  const next: Settings = {
    ...DEFAULT_SETTINGS,
    ...saved,
    opacity: migrateOpacity(saved.opacity),
    labels: migrateLabels(saved.labels),
    colors: { ...DEFAULT_SETTINGS.colors, ...(saved.colors ?? {}) },
    pillPos: saved.pillPos ?? null,
  };
  // 语言偏好一读出来就同步给 i18n，界面和标记都会跟着变
  setLocale(next.locale);
  return next;
}

export async function patchSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch };
  await settingsItem.setValue(next);
  setLocale(next.locale);
  return next;
}

export async function getRules(): Promise<Rule[]> {
  return (await rulesItem.getValue()) ?? [];
}

export async function setRules(rules: Rule[]): Promise<void> {
  await rulesItem.setValue(rules);
}

export async function getOverrides(): Promise<Overrides> {
  return (await overridesItem.getValue()) ?? {};
}

export async function setOverride(host: string, env: Overrides[string] | null): Promise<void> {
  const all = await getOverrides();
  if (env === null) delete all[host];
  else all[host] = env;
  await overridesItem.setValue(all);
}
