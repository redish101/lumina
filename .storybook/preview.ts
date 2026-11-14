import type { Preview } from 'storybook';
import { withThemeByDataAttribute } from '@storybook/addon-themes';

// 组件库的全局样式（设计令牌 + 重置），所有 story 共享
import '../src/styles/index.css';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    // 主题切换：在 <html> 上设置 data-theme="light|dark"，组件样式通过 tokens.css 自动响应
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    layout: 'padded',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' 只在测试中提示；改为 'error' 可让 CI 因可访问性问题失败
      test: 'todo',
    },
    options: {
      // 侧边栏排序：先文档，再组件
      storySort: {
        order: ['Introduction', 'Components', '*'],
      },
    },
  },
};

export default preview;
