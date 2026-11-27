/**
 * 轻量 i18n：一份扁平字典 + 运行时可切换的语言。
 *
 * 之所以不引 i18next：扩展里只有两个界面和几十条文案，
 * 而且 content script 也要用到（标记里的环境名称），
 * 保持纯函数、零依赖反而更省心。
 */

export type Locale = 'zh' | 'en';
/** 设置里保存的是偏好，'auto' 表示跟随浏览器 */
export type LocalePref = 'auto' | Locale;

const zh = {
  'app.name': 'EnvMark',
  'app.tagline': '环境标记',
  'app.slogan': '环境标记 · 别在生产环境手滑',

  'env.production': '生产环境',
  'env.production.short': '生产',
  'env.production.hint': '线上真实数据，改动会影响真实用户',
  'env.staging': '测试环境',
  'env.staging.short': '测试',
  'env.staging.hint': '测试 / 预发布，数据可以随便造',
  'env.development': '开发环境',
  'env.development.short': '开发',
  'env.development.hint': '本地或开发服务器',
  'env.local': '本地环境',
  'env.local.short': '本地',
  'env.local.hint': 'localhost / 局域网地址',

  'style.frame': '边框',
  'style.frame.desc': '沿视口描边',
  'style.frame.detail': '沿视口四周描边，不挡住任何页面内容',
  'style.strip': '顶部条',
  'style.strip.desc': '通栏色带',
  'style.strip.detail': '顶部通栏色带，存在感最强，会盖住站点顶栏',
  'style.pill': '角标',
  'style.pill.desc': '可拖动标签',
  'style.pill.detail': '悬浮小标签，可以直接拖到顺手的位置',
  'style.watermark': '水印',
  'style.watermark.desc': '中央大字',
  'style.watermark.detail': '中央大字斜向水印，很难忽略，但不挡点击',

  'corner.top-left': '左上角',
  'corner.top-right': '右上角',
  'corner.bottom-left': '左下角',
  'corner.bottom-right': '右下角',

  'source.manual': '手动指定',
  'source.rule': '规则匹配',
  'source.meta': '网页声明',
  'source.heuristic': '自动识别',
  'source.none': '未识别',

  'match.glob': '通配符',
  'match.glob.ph': '*.test.example.com',
  'match.contains': 'URL 包含',
  'match.contains.ph': ':8080 或 /preview/',
  'match.regex': '正则',
  'match.regex.ph': '^https://(.+\\.)?example\\.com/shadow/',

  'detail.manualOff': '已手动关闭此域名的标记',
  'detail.meta': '页面 meta / 全局变量声明',

  'popup.unsupportedTitle': '当前页面无法标记',
  'popup.unsupportedDesc': '浏览器内置页面、应用商店等页面不允许注入脚本',
  'popup.unknown': '未识别',
  'popup.hidden': '本页标记已隐藏',
  'popup.restore': '恢复',
  'popup.prodOff': '生产环境标记已关闭',
  'popup.specify': '指定环境',
  'popup.onlyHost': '仅对当前域名生效',
  'popup.follow': '跟随规则自动判断',
  'popup.dontMark': '不标记此站',
  'popup.style': '标记样式',
  'popup.showHost': '显示域名',
  'popup.markProd': '标记生产环境',
  'popup.saveRule': '把当前域名存为规则',
  'popup.saved': '已保存规则',
  'popup.savedFromPopup': '从弹窗添加',
  'popup.allSettings': '全部设置',
  'popup.openSettings': '打开全部设置',

  'nav.general': '常规',
  'nav.appearance': '外观',
  'nav.rules': '规则',
  'nav.data': '数据',

  'general.title': '识别方式',
  'general.desc':
    'EnvMark 不会上传任何数据：环境判定完全在你本地完成，规则和设置只存在浏览器里。',
  'general.global': '全局开关',
  'general.globalDesc': '控制标记的显示范围与识别行为',
  'general.heuristic': '域名关键词自动识别',
  'general.heuristicDesc': '域名中出现 test / staging / uat / dev / localhost 等词时自动判断环境',
  'general.markProd': '标记生产环境',
  'general.markProdDesc':
    '关闭后生产环境不加任何标记，只在弹窗里显示，适合只在测试环境做提示的场景',
  'general.showHost': '标记中显示域名',
  'general.showHostDesc': '在标记里附带当前 hostname，方便截图沟通',
  'general.order': '判定顺序',
  'general.orderDesc': '从上到下，第一个命中的结果生效',
  'general.flow1': '手动指定',
  'general.flow1Desc': '在弹窗里为某个域名固定环境，优先级最高',
  'general.flow2': '规则匹配',
  'general.flow2Desc': '按你写的通配符 / 正则 / URL 片段从上到下匹配',
  'general.flow3': '网页声明',
  'general.flow3Desc': '读取页面里的 meta、data-env 等环境声明',
  'general.flow4': '关键词识别',
  'general.flow4Desc': '域名里出现 test、staging、dev、localhost 等词时自动判断',
  'general.language': '界面语言',
  'general.languageDesc': '切换后立即生效，标记里的环境名称也会跟着变（自己改过的名称保持不变）',
  'general.langAuto': '跟随浏览器',
  'general.langZh': '中文',
  'general.langEn': 'English',

  'appearance.title': '外观',
  'appearance.desc':
    '标记的意义在于「一眼就看见」。默认的边框样式不会遮挡页面内容，同时在视觉上把整个窗口框住。',
  'appearance.style': '标记样式',
  'appearance.styleDesc': '四种样式可以随时切换，页面上实时生效',
  'appearance.position': '角标位置',
  'appearance.positionHint': '仅在「角标」样式下生效',
  'appearance.positionDrag': '选「角标」样式后，可以直接在页面上拖动它',
  'appearance.custom': '自定义位置',
  'appearance.clearPos': '重置到右上角',
  'appearance.opacity': '不透明度',
  'appearance.opacityNote': '角标始终不透明，避免拖动时看不清',
  'appearance.names': '名称与配色',
  'appearance.namesDesc': '按你团队的说法命名，例如「预发布」「灰度」',
  'appearance.preview': '预览',
  'appearance.restore': '恢复默认',
  'appearance.pickColor': '选择颜色',

  'rules.title': '识别规则',
  'rules.desc':
    '从上到下依次匹配，第一条命中的规则决定环境。带 / 的通配符会匹配完整 URL，否则只匹配域名。',
  'rules.add': '新增规则',
  'rules.empty': '还没有任何规则',
  'rules.emptyDesc':
    '关键词识别通常已经够用。如果域名里没有 test / dev 这类词，建议按域名加一条规则，或者直接在弹窗里点「把当前域名存为规则」。',
  'rules.ex1': '测试域名',
  'rules.ex2': '预发布域名',
  'rules.ex3': '线上后台',
  'rules.enable': '启用规则',
  'rules.remove': '删除规则',
  'rules.note': '备注（可选）',
  'rules.try': '试一试',
  'rules.tryDesc': '粘贴一个地址，看看会被判定成什么环境',
  'rules.url': '页面地址',
  'rules.noMatch': '没有命中任何规则，也不会被关键词识别，因此不会显示标记',
  'rules.invalid': '请输入合法的 URL',

  'data.title': '数据与快捷键',
  'data.desc': '所有配置都保存在浏览器本地，可随时导出备份或换机迁移。',
  'data.backup': '配置备份',
  'data.backupDesc': '导出的 JSON 包含设置与全部规则',
  'data.export': '导出配置',
  'data.import': '导入配置',
  'data.resetConfirm': '确定清空所有设置和规则？',
  'data.resetYes': '确认重置',
  'data.cancel': '取消',
  'data.reset': '恢复默认',
  'data.exported': '配置已导出',
  'data.imported': '配置已导入',
  'data.importFail': '导入失败：文件格式不正确',
  'data.resetDone': '已恢复默认设置',
  'data.shortcut': '快捷键',
  'data.shortcutDesc': '临时隐藏当前页面的标记，不改变任何设置',
  'data.shortcutAction': '显示 / 隐藏当前页面标记',
  'data.shortcutHintBefore': '想换成别的组合键：打开',
  'data.shortcutHintAfter': '，找到 EnvMark 修改即可。',
  'data.about': '关于',
  'data.aboutVersion': '基于 WXT + React + Tailwind 构建。',
  'data.aboutPrivacy':
    '除了你主动在弹窗里点击的操作，扩展不会修改任何页面内容；标记层渲染在独立的 Shadow DOM 中，样式与页面完全隔离，也不会拦截鼠标事件。',
} as const;

export type MessageKey = keyof typeof zh;

const en: Record<MessageKey, string> = {
  'app.name': 'EnvMark',
  'app.tagline': 'Environment marker',
  'app.slogan': 'Environment marker — stop fat-fingering production',

  'env.production': 'Production',
  'env.production.short': 'Prod',
  'env.production.hint': 'Live data, changes affect real users',
  'env.staging': 'Staging',
  'env.staging.short': 'Test',
  'env.staging.hint': 'Test / pre-release, data is disposable',
  'env.development': 'Development',
  'env.development.short': 'Dev',
  'env.development.hint': 'Local or dev server',
  'env.local': 'Local',
  'env.local.short': 'Local',
  'env.local.hint': 'localhost / LAN address',

  'style.frame': 'Frame',
  'style.frame.desc': 'Viewport border',
  'style.frame.detail': 'A border around the viewport, covers nothing',
  'style.strip': 'Top strip',
  'style.strip.desc': 'Full-width bar',
  'style.strip.detail': 'Full-width bar on top, the loudest option — covers the site header',
  'style.pill': 'Badge',
  'style.pill.desc': 'Draggable badge',
  'style.pill.detail': 'A small floating badge you can drag anywhere',
  'style.watermark': 'Watermark',
  'style.watermark.desc': 'Big centered text',
  'style.watermark.detail': 'Large diagonal watermark, hard to miss, never blocks clicks',

  'corner.top-left': 'Top left',
  'corner.top-right': 'Top right',
  'corner.bottom-left': 'Bottom left',
  'corner.bottom-right': 'Bottom right',

  'source.manual': 'Manual',
  'source.rule': 'Rule match',
  'source.meta': 'Page-declared',
  'source.heuristic': 'Auto-detected',
  'source.none': 'Unknown',

  'match.glob': 'Glob',
  'match.glob.ph': '*.test.example.com',
  'match.contains': 'URL contains',
  'match.contains.ph': ':8080 or /preview/',
  'match.regex': 'Regex',
  'match.regex.ph': '^https://(.+\\.)?example\\.com/shadow/',

  'detail.manualOff': 'Marking is turned off for this domain',
  'detail.meta': 'Declared by page meta / global variable',

  'popup.unsupportedTitle': 'This page cannot be marked',
  'popup.unsupportedDesc': 'Browser internal pages and the Web Store do not allow scripts',
  'popup.unknown': 'Unknown',
  'popup.hidden': 'Marker hidden on this page',
  'popup.restore': 'Restore',
  'popup.prodOff': 'Production marking is off',
  'popup.specify': 'Set environment',
  'popup.onlyHost': 'Applies to this domain only',
  'popup.follow': 'Follow rules',
  'popup.dontMark': 'Do not mark',
  'popup.style': 'Marker style',
  'popup.showHost': 'Show hostname',
  'popup.markProd': 'Mark production',
  'popup.saveRule': 'Save this domain as a rule',
  'popup.saved': 'Rule saved',
  'popup.savedFromPopup': 'Added from popup',
  'popup.allSettings': 'Settings',
  'popup.openSettings': 'Open full settings',

  'nav.general': 'General',
  'nav.appearance': 'Appearance',
  'nav.rules': 'Rules',
  'nav.data': 'Data',

  'general.title': 'Detection',
  'general.desc':
    'EnvMark uploads nothing. Detection runs entirely on your machine; rules and settings stay in your browser.',
  'general.global': 'Global switches',
  'general.globalDesc': 'Control when markers appear and how detection works',
  'general.heuristic': 'Detect from hostname keywords',
  'general.heuristicDesc': 'Guesses the environment when the hostname contains test, staging, uat, dev, localhost, and similar words',
  'general.markProd': 'Mark production',
  'general.markProdDesc':
    'When off, production gets no marker at all and only shows in the popup — handy if you only need warnings on test environments',
  'general.showHost': 'Show hostname in marker',
  'general.showHostDesc': 'Appends the current hostname, useful for screenshots and bug reports',
  'general.order': 'Priority',
  'general.orderDesc': 'Evaluated top to bottom, first hit wins',
  'general.flow1': 'Manual',
  'general.flow1Desc': 'Pin an environment for a domain from the popup — highest priority',
  'general.flow2': 'Rules',
  'general.flow2Desc': 'Your glob / regex / URL-substring rules, matched top to bottom',
  'general.flow3': 'Page-declared',
  'general.flow3Desc': 'Reads meta tags and data-env declarations on the page',
  'general.flow4': 'Hostname keywords',
  'general.flow4Desc': 'Guesses from words like test, staging, dev, localhost in the domain',
  'general.language': 'Language',
  'general.languageDesc':
    'Takes effect immediately, including the environment names inside markers (renamed ones stay as you set them)',
  'general.langAuto': 'Match browser',
  'general.langZh': '中文',
  'general.langEn': 'English',

  'appearance.title': 'Appearance',
  'appearance.desc':
    'A marker only works if you notice it. The default frame surrounds the window without covering any content.',
  'appearance.style': 'Marker style',
  'appearance.styleDesc': 'Switch any time, applies to open pages instantly',
  'appearance.position': 'Badge position',
  'appearance.positionHint': 'Only applies to the badge style',
  'appearance.positionDrag': 'With the badge style, you can drag it right on the page',
  'appearance.custom': 'Custom position',
  'appearance.clearPos': 'Reset to top right',
  'appearance.opacity': 'Opacity',
  'appearance.opacityNote': 'The badge always stays opaque so it never gets hard to grab',
  'appearance.names': 'Names and colors',
  'appearance.namesDesc': 'Use your team’s wording, e.g. pre-release or canary',
  'appearance.preview': 'Preview',
  'appearance.restore': 'Reset to default',
  'appearance.pickColor': 'Pick a color',

  'rules.title': 'Rules',
  'rules.desc':
    'Matched top to bottom, the first hit decides the environment. Globs containing / match the full URL, otherwise only the hostname.',
  'rules.add': 'Add rule',
  'rules.empty': 'No rules yet',
  'rules.emptyDesc':
    'Hostname keywords are usually enough. If your domains have no test or dev in them, add a rule — or just hit “Save this domain as a rule” in the popup.',
  'rules.ex1': 'test domain',
  'rules.ex2': 'staging domain',
  'rules.ex3': 'production admin',
  'rules.enable': 'Enable rule',
  'rules.remove': 'Delete rule',
  'rules.note': 'Note (optional)',
  'rules.try': 'Try it',
  'rules.tryDesc': 'Paste a URL to see what it resolves to',
  'rules.url': 'Page URL',
  'rules.noMatch': 'No rule matched and keywords did not apply, so nothing will be marked',
  'rules.invalid': 'Enter a valid URL',

  'data.title': 'Data and shortcuts',
  'data.desc': 'Everything is stored locally in your browser. Export any time to back up or move machines.',
  'data.backup': 'Backup',
  'data.backupDesc': 'The exported JSON contains settings and all rules',
  'data.export': 'Export',
  'data.import': 'Import',
  'data.resetConfirm': 'Clear all settings and rules?',
  'data.resetYes': 'Yes, reset',
  'data.cancel': 'Cancel',
  'data.reset': 'Reset to defaults',
  'data.exported': 'Settings exported',
  'data.imported': 'Settings imported',
  'data.importFail': 'Import failed: invalid file',
  'data.resetDone': 'Reset to defaults',
  'data.shortcut': 'Keyboard shortcut',
  'data.shortcutDesc': 'Temporarily hide the marker on the current page without changing settings',
  'data.shortcutAction': 'Show / hide the marker',
  'data.shortcutHintBefore': 'To change it, open',
  'data.shortcutHintAfter': ', find EnvMark and edit the shortcut.',
  'data.about': 'About',
  'data.aboutVersion': 'Built with WXT, React and Tailwind.',
  'data.aboutPrivacy':
    'Apart from the actions you take in the popup, the extension never modifies page content. The marker renders in an isolated Shadow DOM and never intercepts mouse events.',
};

const DICTS: Record<Locale, Record<MessageKey, string>> = { zh, en };

/** 供旧版本数据迁移使用：这四句是历史默认名称 */
export const ZH_ENV_LABELS = {
  production: zh['env.production'],
  staging: zh['env.staging'],
  development: zh['env.development'],
  local: zh['env.local'],
};

let active: Locale = 'zh';
const listeners = new Set<() => void>();

/** 按偏好 + 浏览器语言决定实际使用的语言 */
export function detectLocale(pref: LocalePref): Locale {
  if (pref === 'zh' || pref === 'en') return pref;
  if (typeof navigator === 'undefined') return 'zh';
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return langs.some((l) => l.toLowerCase().startsWith('zh')) ? 'zh' : 'en';
}

export function getLocale(): Locale {
  return active;
}

export function setLocale(pref: LocalePref): void {
  const next = detectLocale(pref);
  if (next === active) return;
  active = next;
  for (const fn of listeners) fn();
}

export function subscribeLocale(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** 取一条文案，`{name}` 形式的占位符会被替换 */
export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  const dict = DICTS[active] ?? DICTS.zh;
  let text = dict[key] ?? DICTS.zh[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}
