import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    // 名称与简介走 _locales，浏览器会按界面语言显示（商店页另外单独填）
    default_locale: 'zh_CN',
    name: '__MSG_extName__',
    description: '__MSG_extDescription__',
    // 只申请真正用到的权限：
    // storage —— 保存规则与外观设置
    // 页面访问由 content_scripts.matches 声明，无需 activeTab（弹窗只取 tab.id，不读 url）
    permissions: ['storage'],
    action: {
      default_title: '__MSG_extName__',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    commands: {
      'toggle-marker': {
        suggested_key: { default: 'Alt+Shift+E' },
        description: '__MSG_cmdToggle__',
      },
    },
  },
  vite: () => ({
    plugins: [tailwindcss() as never],
  }),
});
