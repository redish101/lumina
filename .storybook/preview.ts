import type { Preview } from 'storybook';
import { withLuminaTheme } from './decorators';

// 组件库的全局样式（设计令牌 + 重置），所有 story 共享
import '../src/styles/index.css';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withLuminaTheme],
  globalTypes: {
    theme: {
      description: '明暗主题',
      toolbar: {
        title: '主题',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
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
