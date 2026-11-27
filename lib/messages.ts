import { browser } from '#imports';
import type { EnvKey, EnvSource, MarkerStyle } from './types';

export const MSG = {
  getState: 'envmark:get-state',
  refresh: 'envmark:refresh',
  toggle: 'envmark:toggle',
  report: 'envmark:report',
} as const;

export interface PageState {
  supported: boolean;
  host?: string;
  href?: string;
  env?: EnvKey | null;
  source?: EnvSource;
  detail?: string;
  hidden?: boolean;
  style?: MarkerStyle;
  marked?: boolean;
}

export const UNSUPPORTED_STATE: PageState = { supported: false };

export async function askPageState(tabId: number): Promise<PageState> {
  try {
    const res = (await browser.tabs.sendMessage(tabId, { type: MSG.getState })) as PageState;
    return res?.supported ? res : UNSUPPORTED_STATE;
  } catch {
    return UNSUPPORTED_STATE;
  }
}

export async function refreshPageState(tabId: number): Promise<PageState> {
  try {
    const res = (await browser.tabs.sendMessage(tabId, { type: MSG.refresh })) as PageState;
    return res?.supported ? res : UNSUPPORTED_STATE;
  } catch {
    return UNSUPPORTED_STATE;
  }
}

export async function togglePageMarker(tabId: number): Promise<PageState> {
  try {
    const res = (await browser.tabs.sendMessage(tabId, { type: MSG.toggle })) as PageState;
    return res?.supported ? res : UNSUPPORTED_STATE;
  } catch {
    return UNSUPPORTED_STATE;
  }
}
