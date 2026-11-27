import { t, type MessageKey } from './i18n';
import type { Corner, EnvKey, MarkerStyle, MatchType, OpacityKey } from './types';

interface EnvMeta {
  /** 英文短码 */
  code: string;
  /** 工具栏角标字母 */
  letter: string;
  /** 默认主色 */
  color: string;
}

/**
 * 环境的结构性信息（短码、角标字母、默认色）放在这里；
 * 名称和说明文案在 lib/i18n.ts，因为需要跟随语言切换。
 */
export const ENV_META: Record<EnvKey, EnvMeta> = {
  production: { code: 'PROD', letter: 'P', color: '#e11d48' },
  staging: { code: 'TEST', letter: 'T', color: '#b45309' },
  development: { code: 'DEV', letter: 'D', color: '#2563eb' },
  local: { code: 'LOCAL', letter: 'L', color: '#7c3aed' },
};

export const ENV_KEYS: EnvKey[] = ['production', 'staging', 'development', 'local'];

export const STYLE_KEYS: MarkerStyle[] = ['frame', 'strip', 'pill', 'watermark'];

/** 可以单独调透明度的样式 */
export const OPACITY_KEYS: OpacityKey[] = ['frame', 'strip', 'watermark'];

export const CORNER_KEYS: Corner[] = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];

export const MATCH_TYPES: MatchType[] = ['glob', 'contains', 'regex'];

const envKey = (key: EnvKey, suffix = '') => `env.${key}${suffix}` as MessageKey;

/** 环境名称：用户改过就用他的，否则取当前语言的内置名称 */
export function envLabel(labels: Partial<Record<EnvKey, string>>, key: EnvKey): string {
  const custom = labels[key]?.trim();
  return custom || t(envKey(key));
}

/** 环境简称，弹窗里的四宫格用 */
export function envShortLabel(labels: Partial<Record<EnvKey, string>>, key: EnvKey): string {
  const custom = labels[key]?.trim();
  return custom || t(envKey(key, '.short'));
}

export function envHint(key: EnvKey): string {
  return t(envKey(key, '.hint'));
}

export function styleLabel(style: MarkerStyle): string {
  return t(`style.${style}` as MessageKey);
}

export function styleDesc(style: MarkerStyle): string {
  return t(`style.${style}.desc` as MessageKey);
}

export function styleDetail(style: MarkerStyle): string {
  return t(`style.${style}.detail` as MessageKey);
}

export function cornerLabel(corner: Corner): string {
  return t(`corner.${corner}` as MessageKey);
}

export function sourceLabel(source: string): string {
  return t(`source.${source}` as MessageKey);
}

export function matchLabel(type: MatchType): string {
  return t(`match.${type}` as MessageKey);
}

export function matchPlaceholder(type: MatchType): string {
  return t(`match.${type}.ph` as MessageKey);
}

/** 环境的默认色（用户没改过时用） */
export function envColor(colors: Partial<Record<EnvKey, string>>, key: EnvKey): string {
  return colors[key] || ENV_META[key].color;
}
