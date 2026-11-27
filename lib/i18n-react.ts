import { useSyncExternalStore } from 'react';
import { getLocale, subscribeLocale, t, type Locale } from './i18n';

/** 当前语言，语言变化时会触发重渲染 */
export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale, getLocale);
}

/**
 * 返回翻译函数。`t` 本身是稳定的，但组件需要订阅语言变化才会重渲染，
 * 所以这里读一次 locale。
 */
export function useT() {
  useLocale();
  return t;
}
