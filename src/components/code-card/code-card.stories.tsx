import type { Meta, StoryObj } from '@storybook/react-vite';
import { CodeCard } from './code-card';

const sample = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}`;

const longLine = `const globals = { theme: 'light', density: 'comfortable', locale: 'zh-CN', telemetry: false, motion: 'full', contrast: 'normal' };`;

const meta = {
  title: 'Components/CodeCard',
  component: CodeCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '带标题栏的代码块：头部展示语言、标题与状态，右侧复制按钮在成功后给出 1.2 秒反馈。' +
          '正文默认横向滚动，也可开启行号或自动换行；代码原文按行渲染，复制内容与展示一致。',
      },
    },
  },
  args: {
    code: sample,
    language: 'tsx',
  },
  argTypes: {
    code: { control: 'text', description: '代码原文' },
    language: { control: 'text', description: '语言标签' },
    title: { control: 'text', description: '标题，超长时省略' },
    status: { control: 'text', description: '右侧状态文字' },
    showLineNumbers: { control: 'boolean', description: '是否显示行号' },
    wrap: { control: 'boolean', description: '是否让长行自动换行' },
    copyable: { control: 'boolean', description: '是否显示复制按钮' },
    copyLabel: { control: 'text', description: '复制按钮文案' },
    copiedLabel: { control: 'text', description: '复制成功后的文案' },
    className: { control: false, description: '追加的类名' },
  },
} satisfies Meta<typeof CodeCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 最简形态：语言标签加复制按钮。 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

/** 标题、语言和状态一起出现在头部，标题过长会省略。 */
export const WithHeader: Story = {
  args: {
    title: 'src/components/counter/counter.tsx',
    status: '已修改',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

/** 开启行号后，行号列由 CSS counter 生成。 */
export const LineNumbers: Story = {
  args: { showLineNumbers: true },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

/** 自动换行适合窄容器里的配置片段。 */
export const Wrapped: Story = {
  args: {
    code: longLine,
    language: 'ts',
    title: 'globals.ts',
    wrap: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
};

/** 不需要复制时可关闭按钮，头部只保留语言和标题。 */
export const NoCopy: Story = {
  args: {
    copyable: false,
    title: '只读示例',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 560 }}>
        <Story />
      </div>
    ),
  ],
};

/** 长行默认横向滚动，不改变缩进与代码格式。 */
export const Scrollable: Story = {
  args: {
    code: longLine,
    language: 'ts',
    title: 'globals.ts',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 340 }}>
        <Story />
      </div>
    ),
  ],
};
