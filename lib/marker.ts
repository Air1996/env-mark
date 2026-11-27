import type { Corner, MarkerStyle, PillPosition } from './types';

export interface MarkerModel {
  style: MarkerStyle;
  corner: Corner;
  /** 已经按当前样式解析好的不透明度 5 - 100 */
  opacity: number;
  /** 角标自定义位置，null 表示用 corner 预设 */
  pillPos: PillPosition | null;
  showHost: boolean;
  label: string;
  code: string;
  color: string;
  /** 前景文字色，自动按主色亮度计算 */
  foreground: string;
  host: string;
  /** 用于 hover 提示的说明，例如「规则 *.example.com」 */
  detail?: string;
  /** 拖动角标结束后的回调，参数是角标中心在视口中的比例位置 */
  onMove?: (pos: PillPosition) => void;
}

const HOST_ID = 'envmark-root';

const CSS = `
:host { all: initial; }

*, *::before, *::after { box-sizing: border-box; }

.layer {
  position: absolute;
  inset: 0;
  display: block;
  pointer-events: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 12px;
  line-height: 1;
  text-align: left;
  -webkit-font-smoothing: antialiased;
  opacity: var(--om, 1);
  transition: opacity 160ms ease;
}

/* ---------- 通用 ---------- */
.dot {
  position: relative;
  flex: 0 0 auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--fg);
}
.dot::after {
  content: "";
  position: absolute;
  inset: -3.5px;
  border-radius: 50%;
  border: 1.5px solid var(--fg);
  opacity: .5;
  animation: envmark-ping 2.4s cubic-bezier(0, 0, .2, 1) infinite;
}
@keyframes envmark-ping {
  0% { transform: scale(.65); opacity: .75; }
  70%, 100% { transform: scale(1.6); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .dot::after { animation: none; opacity: .3; }
}

.name {
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: .01em;
  color: var(--fg);
  white-space: nowrap;
}

.code {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .12em;
  line-height: 1;
  padding: 3px 5px;
  border-radius: 4px;
  background: rgba(0, 0, 0, .22);
  color: var(--fg);
}

.host {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10.5px;
  font-weight: 500;
  color: var(--fg);
  opacity: .8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 45vw;
}

.pill {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 7px;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--c);
  box-shadow: 0 3px 12px -3px rgba(0, 0, 0, .45), inset 0 0 0 1px rgba(255, 255, 255, .22);
  max-width: 90vw;
}

/* ---------- 1. 边框 ---------- */
.frame {
  position: absolute;
  inset: 0;
  border: 4px solid var(--c);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .22);
}
.frame .pill {
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
}

/* ---------- 2. 顶部条 ---------- */
.strip {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 26px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: var(--c);
  box-shadow: 0 1px 0 rgba(0, 0, 0, .2), 0 6px 18px -8px rgba(0, 0, 0, .4);
}
.strip .brand {
  margin-left: auto;
  font-size: 8.5px;
  font-weight: 800;
  letter-spacing: .18em;
  color: var(--fg);
  opacity: .55;
}
.strip .sep {
  width: 1px;
  height: 10px;
  background: var(--fg);
  opacity: .25;
}

/* ---------- 3. 角标 ---------- */
.corner.tl { top: 12px; left: 12px; }
.corner.tr { top: 12px; right: 12px; }
.corner.bl { bottom: 12px; left: 12px; }
.corner.br { bottom: 12px; right: 12px; }

/* 自由位置：left / top 是中心点，用位移把自身摆正 */
.pill.free {
  transform: translate(-50%, -50%);
}

/* 可拖动：只有这一层元素接收鼠标事件，整层依然是 pointer-events: none */
.pill.draggable {
  pointer-events: auto;
  cursor: grab;
  touch-action: none;
  user-select: none;
  -webkit-user-drag: none;
  transition: box-shadow 140ms ease;
}
.pill.draggable:hover {
  box-shadow: 0 4px 16px -3px rgba(0, 0, 0, .5), inset 0 0 0 1px rgba(255, 255, 255, .32),
    0 0 0 2px rgba(255, 255, 255, .28);
}
.pill.dragging {
  cursor: grabbing;
}

/* ---------- 4. 水印 ---------- */
.wm {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.wm span {
  font-size: min(15vw, 220px);
  font-weight: 900;
  letter-spacing: .06em;
  line-height: 1;
  color: var(--c);
  opacity: 1;
  transform: rotate(-16deg);
  white-space: nowrap;
  user-select: none;
}
`;

let cachedHost: HTMLElement | null = null;

export function ensureHost(): HTMLElement {
  if (cachedHost?.isConnected) return cachedHost;
  const existing = document.getElementById(HOST_ID) as HTMLElement | null;
  if (existing) {
    cachedHost = existing;
    return existing;
  }

  const host = document.createElement('div');
  host.id = HOST_ID;
  host.setAttribute('aria-hidden', 'true');
  host.setAttribute('data-envmark', '1');
  const set = (prop: string, value: string) =>
    host.style.setProperty(prop, value, 'important');
  set('all', 'initial');
  set('position', 'fixed');
  set('inset', '0');
  set('display', 'block');
  set('width', '100%');
  set('height', '100%');
  set('margin', '0');
  set('padding', '0');
  set('border', '0');
  set('background', 'transparent');
  set('pointer-events', 'none');
  set('z-index', '2147483647');
  set('transform', 'none');
  set('filter', 'none');
  set('visibility', 'visible');
  set('opacity', '1');

  (document.documentElement ?? document.body).appendChild(host);
  cachedHost = host;
  return host;
}

function node<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/**
 * 让角标可以直接拖动。只有角标元素开了 pointer-events，
 * 其余标记层仍然完全穿透，不会影响页面交互。
 */
function makeDraggable(pill: HTMLElement, model: MarkerModel): void {
  pill.classList.add('draggable');

  let dragging = false;
  let moved = false;
  let last: PillPosition | null = null;
  // 按下时鼠标相对角标中心的偏移，保证拖动时角标跟着手走，而不是瞬移到指针下
  let grabX = 0;
  let grabY = 0;

  const apply = (clientX: number, clientY: number) => {
    const halfW = pill.offsetWidth / 2 + 6;
    const halfH = pill.offsetHeight / 2 + 6;
    const x = clamp(clientX + grabX, halfW, window.innerWidth - halfW) / window.innerWidth;
    const y = clamp(clientY + grabY, halfH, window.innerHeight - halfH) / window.innerHeight;
    pill.style.left = `${x * 100}%`;
    pill.style.top = `${y * 100}%`;
    last = { x, y };
  };

  pill.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    dragging = true;
    moved = false;
    last = null;
    const rect = pill.getBoundingClientRect();
    grabX = rect.left + rect.width / 2 - e.clientX;
    grabY = rect.top + rect.height / 2 - e.clientY;
    // 从预置角落开始拖时，必须先摘掉 corner 类：
    // 否则 right/bottom 和拖动写入的 left/top 会同时生效，角标被拉长
    pill.classList.remove('corner', 'tl', 'tr', 'bl', 'br');
    pill.classList.add('free', 'dragging');
    try {
      pill.setPointerCapture(e.pointerId);
    } catch {
      /* 部分环境不支持捕获，退化成普通拖动 */
    }
    apply(e.clientX, e.clientY);
  });

  pill.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    moved = true;
    apply(e.clientX, e.clientY);
  });

  const end = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    pill.classList.remove('dragging');
    try {
      pill.releasePointerCapture(e.pointerId);
    } catch {
      /* 忽略 */
    }
    // 位置在拖动过程中已经写进 DOM，这里只负责持久化，避免每帧写一次 storage
    if (moved && last) model.onMove?.(last);
  };

  pill.addEventListener('pointerup', end);
  pill.addEventListener('pointercancel', end);

  // 拖拽结束后浏览器仍可能补一个 click，别让它落到页面上
  pill.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
}

function buildContent(model: MarkerModel): HTMLElement {
  const frag = document.createDocumentFragment();

  const dot = () => node('span', 'dot');
  const name = () => node('span', 'name', model.label);
  const code = () => node('span', 'code', model.code);
  const host = () => node('span', 'host', model.host);

  if (model.style === 'frame') {
    const frame = node('div', 'frame');
    const pill = node('div', 'pill');
    pill.append(dot(), name());
    if (model.showHost) pill.append(host());
    frame.append(pill);
    frag.append(frame);
  } else if (model.style === 'strip') {
    const strip = node('div', 'strip');
    strip.append(dot(), name(), code());
    if (model.showHost) strip.append(node('span', 'sep'), host());
    strip.append(node('span', 'brand', 'ENVMARK'));
    frag.append(strip);
  } else if (model.style === 'pill') {
    const map: Record<Corner, string> = {
      'top-left': 'tl',
      'top-right': 'tr',
      'bottom-left': 'bl',
      'bottom-right': 'br',
    };
    const pill = node('div', 'pill');
    if (model.pillPos) {
      pill.classList.add('free');
      pill.style.left = `${model.pillPos.x * 100}%`;
      pill.style.top = `${model.pillPos.y * 100}%`;
    } else {
      pill.classList.add('corner', map[model.corner]);
    }
    pill.append(dot(), code());
    if (model.showHost) pill.append(host());
    makeDraggable(pill, model);
    frag.append(pill);
  } else {
    const wm = node('div', 'wm');
    wm.append(node('span', undefined, model.label));
    frag.append(wm);
  }

  const wrapper = node('div', 'layer');
  wrapper.style.setProperty('--c', model.color);
  wrapper.style.setProperty('--fg', model.foreground ?? '#fff');
  wrapper.style.setProperty('--om', String(model.opacity / 100));
  wrapper.append(frag);
  return wrapper;
}

export interface MarkerHandle {
  update(model: MarkerModel | null): void;
  destroy(): void;
}

export function createMarker(): MarkerHandle {
  const host = ensureHost();
  const shadow = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
  shadow.replaceChildren();

  const style = document.createElement('style');
  style.textContent = CSS;
  shadow.append(style);

  return {
    update(model) {
      const old = shadow.querySelector('.layer');
      if (!model) {
        old?.remove();
        return;
      }
      const next = buildContent(model);
      if (old) old.replaceWith(next);
      else shadow.append(next);
    },
    destroy() {
      host.remove();
      cachedHost = null;
    },
  };
}
