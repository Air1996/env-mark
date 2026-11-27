import { browser, defineBackground } from '#imports';
import { ENV_META } from '@/lib/envs';
import { MSG } from '@/lib/messages';
import type { EnvKey } from '@/lib/types';

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender) => {
    const msg = message as { type?: string; env?: EnvKey | null } | null;
    if (msg?.type === MSG.report && sender.tab?.id != null) {
      void paintBadge(sender.tab.id, msg.env ?? null);
    }
  });

  // 页面开始加载时先清掉旧角标，避免导航到不支持标记的页面后残留
  browser.tabs.onUpdated.addListener((tabId, info) => {
    if (info.status === 'loading') void paintBadge(tabId, null);
  });

  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'toggle-marker') return;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (tab?.id == null) return;
    try {
      await browser.tabs.sendMessage(tab.id, { type: MSG.toggle });
    } catch {
      /* 当前页面没有内容脚本 */
    }
  });

  browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
      void browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
    }
  });
});

async function paintBadge(tabId: number, env: EnvKey | null) {
  const meta = env ? ENV_META[env] : null;
  try {
    await browser.action.setBadgeText({ tabId, text: meta ? meta.letter : '' });
    if (meta) {
      await browser.action.setBadgeBackgroundColor({ tabId, color: meta.color });
      const action = browser.action as unknown as {
        setBadgeTextColor?: (d: { tabId: number; color: string }) => Promise<void>;
      };
      if (typeof action.setBadgeTextColor === 'function') {
        await action.setBadgeTextColor({ tabId, color: '#ffffff' });
      }
    }
  } catch {
    /* tab 已关闭等情况忽略 */
  }
}
