import { browser } from '#imports';
import { ENV_META, envLabel } from '@/lib/envs';
import { t } from '@/lib/i18n';
import { createMarker } from '@/lib/marker';
import { MSG, type PageState } from '@/lib/messages';
import { detectFromMeta, resolveEnv } from '@/lib/resolve';
import {
  DEFAULT_SETTINGS,
  getOverrides,
  getRules,
  getSettings,
  overridesItem,
  patchSettings,
  rulesItem,
  settingsItem,
} from '@/lib/storage';
import type { OpacityKey, Settings } from '@/lib/types';
import { readableText } from '@/lib/utils';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    const marker = createMarker();
    let hidden = false;
    let settings: Settings = DEFAULT_SETTINGS;
    let state: PageState = { supported: true };
    let lastHref = location.href;

    async function recompute() {
      settings = await getSettings();
      const [rules, overrides] = await Promise.all([getRules(), getOverrides()]);

      let url: URL;
      try {
        url = new URL(location.href);
      } catch {
        return;
      }

      const resolution = resolveEnv({
        url,
        rules,
        settings,
        overrides,
        metaEnv: detectFromMeta(),
      });

      const { env } = resolution;
      const meta = env ? ENV_META[env] : null;
      const shouldPaint = Boolean(
        env && !hidden && (env !== 'production' || settings.markProduction),
      );

      const detail = resolution.detailKey ? t(resolution.detailKey) : resolution.detail;

      if (shouldPaint && env && meta) {
        const color = settings.colors[env] || meta.color;
        const label = envLabel(settings.labels, env);
        // 角标不参与透明度设置：拖动时需要看得清
        const opacity =
          settings.style === 'pill' ? 100 : settings.opacity[settings.style as OpacityKey];
        marker.update({
          style: settings.style,
          corner: settings.corner,
          opacity,
          pillPos: settings.pillPos,
          showHost: settings.showHost,
          label,
          code: meta.code,
          color,
          foreground: readableText(color),
          host: url.hostname,
          detail,
          onMove: (pos) => void patchSettings({ pillPos: pos }),
        });
      } else {
        marker.update(null);
      }

      state = {
        supported: true,
        host: url.hostname,
        href: url.href,
        env,
        source: resolution.source,
        detail,
        hidden,
        marked: shouldPaint,
        style: settings.style,
      };

      // 让工具栏角标同步显示当前环境
      try {
        await browser.runtime.sendMessage({
          type: MSG.report,
          env: shouldPaint ? env : null,
        });
      } catch {
        /* background 未就绪时忽略 */
      }
    }

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const type = (message as { type?: string } | null)?.type;
      if (!type) return;

      (async () => {
        if (type === MSG.getState) {
          sendResponse(state);
        } else if (type === MSG.refresh) {
          await recompute();
          sendResponse(state);
        } else if (type === MSG.toggle) {
          hidden = !hidden;
          await recompute();
          sendResponse(state);
        } else {
          sendResponse({ supported: false });
        }
      })();

      return true;
    });

    settingsItem.watch(() => void recompute());
    rulesItem.watch(() => void recompute());
    overridesItem.watch(() => void recompute());

    // 单页应用路由变化时（hostname 或路径变化会影响 contains / regex 规则）重新计算
    window.setInterval(() => {
      if (location.href !== lastHref) {
        lastHref = location.href;
        void recompute();
      }
    }, 1000);

    void recompute();
  },
});
