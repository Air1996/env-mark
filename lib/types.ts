import type { LocalePref, MessageKey } from './i18n';

/** 环境类型 */
export type EnvKey = 'production' | 'staging' | 'development' | 'local';

/** 规则匹配方式 */
export type MatchType = 'glob' | 'contains' | 'regex';

/** 页面标记样式 */
export type MarkerStyle = 'frame' | 'strip' | 'pill' | 'watermark';

/** 可以单独调整透明度的样式（角标必须保持可辨识，不在此列） */
export type OpacityKey = 'frame' | 'strip' | 'watermark';

/** 角标预设位置 */
export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

/** 角标自定义位置，x / y 都是视口比例（0 - 1），指的是角标中心点 */
export interface PillPosition {
  x: number;
  y: number;
}

/** 环境判定来源 */
export type EnvSource = 'manual' | 'rule' | 'meta' | 'heuristic' | 'none';

export interface Rule {
  id: string;
  /** glob：匹配域名；contains：匹配完整 URL；regex：正则匹配完整 URL */
  pattern: string;
  matchType: MatchType;
  env: EnvKey;
  enabled: boolean;
  note?: string;
}

export interface Settings {
  /** 界面语言，auto 表示跟随浏览器 */
  locale: LocalePref;
  /** 标记样式 */
  style: MarkerStyle;
  /** 角标预设位置（pill 样式且未自定义位置时生效） */
  corner: Corner;
  /** 角标自定义位置，null 表示使用 corner 预设 */
  pillPos: PillPosition | null;
  /** 各样式的不透明度 5 - 100 */
  opacity: Record<OpacityKey, number>;
  /** 标记里是否显示域名 */
  showHost: boolean;
  /** 是否启用域名关键词自动识别 */
  heuristic: boolean;
  /** 是否标记生产环境（关闭后生产环境不加任何标记） */
  markProduction: boolean;
  /** 自定义环境名称，未设置时取当前语言的内置名称 */
  labels: Partial<Record<EnvKey, string>>;
  /** 自定义环境主色 */
  colors: Record<EnvKey, string>;
}

/** 用户对某个域名的强制指定，'none' 表示强制不标记 */
export type Overrides = Record<string, EnvKey | 'none'>;

export interface Resolution {
  env: EnvKey | null;
  source: EnvSource;
  /** 命中的规则 / 说明，用于界面上解释「为什么是这个环境」 */
  detail?: string;
  /** 需要翻译的说明（与 detail 二选一，交给界面按当前语言渲染） */
  detailKey?: MessageKey;
}

export interface AddResult {
  ok: boolean;
  reason?: string;
}
