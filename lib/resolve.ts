import type { EnvKey, Overrides, Resolution, Rule, Settings } from './types';

/** 简单字符串哈希，用于给规则生成稳定 id */
function hash(str: string): string {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export function uid(prefix = 'r'): string {
  return `${prefix}-${Date.now().toString(36)}-${hash(String(Math.random()))}`;
}

/** 把 meta / window 变量里的值换算成环境类型 */
export function parseEnvToken(raw: unknown): EnvKey | null {
  if (typeof raw !== 'string') return null;
  const v = raw.trim().toLowerCase().replace(/^["']|["']$/g, '');
  if (!v) return null;
  if (/^(prod|production|prd|live|release|online)$/.test(v)) return 'production';
  if (/^(staging|stage|stg|test|testing|uat|sit|qa|pre|preview|beta|sandbox|gray|demo)$/.test(v)) {
    return 'staging';
  }
  if (/^(dev|development|develop|local)$/.test(v)) {
    return /^local$/.test(v) ? 'local' : 'development';
  }
  return null;
}

/** glob -> RegExp（仅支持 * 与 ?） */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .trim()
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${escaped}$`, 'i');
}

export function matchRule(rule: Rule, url: URL): boolean {
  const pattern = rule.pattern.trim();
  if (!pattern) return false;
  try {
    if (rule.matchType === 'regex') {
      return new RegExp(pattern, 'i').test(url.href);
    }
    if (rule.matchType === 'contains') {
      return url.href.toLowerCase().includes(pattern.toLowerCase());
    }
    // glob：带路径的匹配完整 URL，否则只匹配域名
    const target = /[/]/.test(pattern) ? url.href : url.hostname;
    return globToRegExp(pattern).test(target);
  } catch {
    return false;
  }
}

/** 从页面自身声明中读取环境（meta / html[data-env] / window.__ENV__） */
export function detectFromMeta(): EnvKey | null {
  if (typeof document === 'undefined') return null;
  const names = new Set([
    'env',
    'environment',
    'app-env',
    'app_env',
    'runtime-env',
    'node-env',
    'build-env',
    'deploy-env',
  ]);

  for (const el of Array.from(document.querySelectorAll('meta[name], meta[property]'))) {
    const key = (el.getAttribute('name') || el.getAttribute('property') || '').toLowerCase();
    if (names.has(key)) {
      const parsed = parseEnvToken(el.getAttribute('content'));
      if (parsed) return parsed;
    }
  }

  const attr = document.documentElement?.dataset?.env;
  if (attr) {
    const parsed = parseEnvToken(attr);
    if (parsed) return parsed;
  }

  const w = window as unknown as Record<string, unknown>;
  for (const key of ['__ENV__', '__APP_ENV__', 'APP_ENV', 'NODE_ENV', '__NODE_ENV__']) {
    const parsed = parseEnvToken(w[key]);
    if (parsed) return parsed;
  }
  return null;
}

const TOKEN_STAGING = new Set([
  'test',
  'tests',
  'testing',
  'staging',
  'stage',
  'stg',
  'uat',
  'sit',
  'qa',
  'pre',
  'preview',
  'beta',
  'sandbox',
  'demo',
  'gray',
  'canary',
]);
const TOKEN_DEV = new Set(['dev', 'develop', 'development', 'developing', 'feature', 'next', 'rc']);
const TOKEN_PROD = new Set(['prod', 'production', 'prd']);

/** 纯域名关键词推断，宁可漏判也不误判 */
export function heuristicEnv(url: URL): EnvKey | null {
  const host = url.hostname.toLowerCase();

  if (url.protocol === 'file:') return 'local';
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '[::1]' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host)
  ) {
    return 'local';
  }

  const tokens = host.split(/[.-]/).filter(Boolean);
  if (tokens.some((t) => TOKEN_STAGING.has(t))) return 'staging';
  if (tokens.some((t) => TOKEN_DEV.has(t))) return 'development';
  if (tokens.some((t) => TOKEN_PROD.has(t))) return 'production';
  return null;
}

/** 按 手动指定 → 规则 → 网页声明 → 自动识别 的优先级解析环境 */
export function resolveEnv(input: {
  url: URL;
  rules: Rule[];
  settings: Settings;
  overrides: Overrides;
  metaEnv?: EnvKey | null;
}): Resolution {
  const { url, rules, settings, overrides, metaEnv } = input;

  const override = overrides[url.hostname];
  if (override === 'none') {
    return { env: null, source: 'manual', detailKey: 'detail.manualOff' };
  }
  if (override) {
    return { env: override, source: 'manual', detail: override };
  }

  for (const rule of rules) {
    if (rule.enabled && matchRule(rule, url)) {
      return { env: rule.env, source: 'rule', detail: rule.pattern };
    }
  }

  if (metaEnv) return { env: metaEnv, source: 'meta', detailKey: 'detail.meta' };

  if (settings.heuristic) {
    const guess = heuristicEnv(url);
    if (guess) return { env: guess, source: 'heuristic', detail: url.hostname };
  }

  return { env: null, source: 'none' };
}
