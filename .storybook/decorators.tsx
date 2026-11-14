import { useEffect, type PropsWithChildren } from 'react';
import type { Decorator } from 'storybook';

/**
 * 把当前主题同步到 <body> 上。
 *
 * tokens.css 的暗色是 `body[data-lumina-dark-theme]`（属性存在即为暗色，不看值），
 * 所以不能用 addon-themes 的 `data-theme` 写法——那个打在 <html> 上、且靠取值区分。
 *
 * 只在 story 视图生效：docs 页的页面底色/表格配色来自 Storybook 自己的主题，
 * 若在这里把整页令牌切成暗色，文档页会变成「浅底 + 深色组件」的割裂画面。
 */
function ThemeSync({ dark, children }: PropsWithChildren<{ dark: boolean }>) {
  useEffect(() => {
    document.body.toggleAttribute('data-lumina-dark-theme', dark);
  }, [dark]);

  return children;
}

export const withLuminaTheme: Decorator = (Story, context) => {
  const dark = context.globals.theme === 'dark' && context.viewMode === 'story';

  return (
    <ThemeSync dark={dark}>
      <Story />
    </ThemeSync>
  );
};
