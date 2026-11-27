/**
 * 生成扩展图标（无外部依赖，纯 Node 输出 PNG）。
 *
 * 图形：深色圆角方块 + 三条环境色进度条（生产 / 测试 / 开发）。
 * 用法：node scripts/gen-icons.mjs
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(ROOT, 'public/icon');
const SIZES = [16, 32, 48, 96, 128];

const BARS = [
  { color: [244, 63, 94], w: 0.63 }, // rose-500   生产
  { color: [245, 158, 11], w: 0.5 }, // amber-500  测试
  { color: [59, 130, 246], w: 0.37 }, // blue-500   开发
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 圆角矩形内部判定 */
function inRoundRect(x, y, cx, cy, hw, hh, r) {
  const dx = Math.abs(x - cx) - hw + r;
  const dy = Math.abs(y - cy) - hh + r;
  if (dx <= 0 && dy <= 0) return true;
  const qx = Math.max(dx, 0);
  const qy = Math.max(dy, 0);
  return qx * qx + qy * qy <= r * r;
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** 采样一个点，返回 [r,g,b,a]（a 为 0..1） */
function sample(u, v) {
  const bg = mix([38, 38, 45], [16, 16, 20], clamp01(v * 1.15 - 0.1));
  if (!inRoundRect(u, v, 0.5, 0.5, 0.5, 0.5, 0.235)) return null;
  if (!inRoundRect(u, v, 0.5, 0.5, 0.5 - 0.012, 0.5 - 0.012, 0.225)) {
    return [...mix(bg, [255, 255, 255], 0.16), 1];
  }

  const barH = 0.095;
  const gap = 0.068;
  const totalH = BARS.length * barH + (BARS.length - 1) * gap;
  const startY = 0.5 - totalH / 2;
  const left = 0.185;
  const maxW = 0.63;

  for (let i = 0; i < BARS.length; i++) {
    const top = startY + i * (barH + gap);
    const hw = (BARS[i].w * 0.5) / 1;
    const cx = left + hw;
    const cy = top + barH / 2;
    if (inRoundRect(u, v, cx, cy, hw, barH / 2, barH / 2)) {
      return [...BARS[i].color, 1];
    }
  }
  return [...bg, 1];
}

function render(size) {
  const SS = 4; // 超采样
  const buf = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      let hits = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const u = (x + (sx + 0.5) / SS) / size;
          const v = (y + (sy + 0.5) / SS) / size;
          const px = sample(u, v);
          if (!px) continue;
          hits++;
          r += px[0] * px[3];
          g += px[1] * px[3];
          b += px[2] * px[3];
          a += px[3];
        }
      }
      const i = (y * size + x) * 4;
      if (a > 0) {
        buf[i] = Math.round(r / a);
        buf[i + 1] = Math.round(g / a);
        buf[i + 2] = Math.round(b / a);
      }
      buf[i + 3] = Math.round((a / (SS * SS)) * 255);
    }
  }
  return buf;
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function toPng(size, rgba) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync(OUT, { recursive: true });
for (const size of SIZES) {
  const png = toPng(size, render(size));
  writeFileSync(resolve(OUT, `${size}.png`), png);
  console.log(`✓ public/icon/${size}.png  (${png.length} bytes)`);
}
