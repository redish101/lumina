import type { Meta, StoryObj } from '@storybook/react-vite';
import { DiffBlock } from './diff-block';

const before = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}`;

const after = `import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const doubled = count * 2;
  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count} / {doubled}
    </button>
  );
}`;

const longBefore = Array.from(
  { length: 18 },
  (_, index) => `const item${index + 1} = ${index + 1};`,
).join('\n');
const longAfter = Array.from({ length: 18 }, (_, index) =>
  index % 3 === 0
    ? `const item${index + 1} = ${index + 1} * 2;`
    : `const item${index + 1} = ${index + 1};`,
).join('\n');

const meta = {
  title: 'Components/DiffBlock',
  component: DiffBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '文件级行差异展示。组件按路径分组，用行级 LCS 计算新增、删除与上下文，' +
          '长差异默认折叠到指定行数；头部可复制带 `+` / `-` 前缀的全文。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    diffs: [{ path: 'src/components/counter/counter.tsx', oldText: before, newText: after }],
  },
  argTypes: {
    diffs: { control: 'object', description: '文件差异列表' },
    maxLines: { control: 'number', description: '折叠时最多显示的行数' },
    wrap: { control: 'boolean', description: '是否让长行自动换行' },
    labels: { control: 'object', description: '覆盖默认中文文案' },
    className: { control: false, description: '追加的类名' },
  },
} satisfies Meta<typeof DiffBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 单个文件的新增与删除，默认折叠阈值为 16 行。 */
export const Default: Story = {};

/** 同时展示多个文件的差异，头部显示文件数量。 */
export const MultipleFiles: Story = {
  args: {
    diffs: [
      { path: 'src/components/counter/counter.tsx', oldText: before, newText: after },
      {
        path: 'src/utils/format.ts',
        oldText: `export function formatCount(value: number) {
  return String(value);
}`,
        newText: `export function formatCount(value: number) {
  return value.toLocaleString('zh-CN');
}`,
      },
    ],
  },
};

/** 新建文件时 `oldText` 为 `null`，所有行都会标为新增。 */
export const NewFile: Story = {
  args: {
    diffs: [
      {
        path: 'src/components/badge/badge.tsx',
        oldText: null,
        newText: `export function Badge({ children }: { children: string }) {
  return <span className="badge">{children}</span>;
}`,
      },
    ],
  },
};

/** 差异超过 `maxLines` 时中段折叠，可展开或收起。 */
export const LongDiff: Story = {
  args: {
    maxLines: 8,
    diffs: [{ path: 'src/utils/constants.ts', oldText: longBefore, newText: longAfter }],
  },
};

/** 超长行不再横向滚动，而是自动换行。 */
export const Wrapped: Story = {
  args: {
    wrap: true,
    diffs: [
      {
        path: 'src/config/theme.ts',
        oldText: `export const theme = { primary: '#3b82f6', radius: 8, density: 'comfortable' };`,
        newText: `export const theme = { primary: '#2563eb', radius: 12, density: 'compact', contrast: 'high', motion: 'reduced' };`,
      },
    ],
  },
};

/** 通过 `labels` 覆盖复制与折叠区域的全部文案。 */
export const CustomLabels: Story = {
  args: {
    maxLines: 6,
    labels: {
      copy: 'Copy',
      copied: 'Copied',
      collapse: 'Collapse',
      expand: (hidden) => `Show ${hidden} more lines`,
      collapseAria: 'Collapse diff',
      expandAria: (hidden) => `Show ${hidden} more lines`,
    },
    diffs: [{ path: 'src/utils/constants.ts', oldText: longBefore, newText: longAfter }],
  },
};
