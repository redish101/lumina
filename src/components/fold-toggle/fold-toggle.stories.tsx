import type { ComponentProps } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FoldToggle } from './fold-toggle';

const defaultLabels = {
  collapseAria: '收起隐藏的内容',
  expandAria: (hidden: number) => `展开剩余 ${hidden} 行`,
  collapse: '收起',
  expand: (hidden: number) => `展开剩余 ${hidden} 行`,
};

const meta = {
  title: 'Components/FoldToggle',
  component: FoldToggle,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '折叠开关：一个铺满宽度的文字按钮，收起时显示剩余行数，展开时显示「收起」。' +
          '状态受控，展开/收起文案与读屏名称都由 `labels` 提供，便于接入不同语言。',
      },
    },
  },
  args: {
    expanded: false,
    hidden: 24,
    labels: defaultLabels,
    onToggle: () => {},
  },
  argTypes: {
    expanded: { control: 'boolean', description: '当前是否已展开' },
    hidden: { control: { type: 'number', min: 0 }, description: '被折叠的行数' },
    labels: { control: false, description: '按钮文案与无障碍名称' },
    onToggle: { action: 'toggled', description: '切换展开状态' },
    controls: { control: 'text', description: '可选的内容区域 id' },
  },
} satisfies Meta<typeof FoldToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({
  initialExpanded = false,
  ...args
}: ComponentProps<typeof FoldToggle> & { initialExpanded?: boolean }) {
  const [expanded, setExpanded] = useState(initialExpanded);
  return (
    <FoldToggle {...args} expanded={expanded} onToggle={() => setExpanded((value) => !value)} />
  );
}

/** 收起状态显示剩余行数，点击后展开。 */
export const Collapsed: Story = {
  render: (args) => <Controlled {...args} />,
};

/** 展开状态显示「收起」。 */
export const Expanded: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <Controlled {...args} initialExpanded />
    </div>
  ),
};

/** 隐藏行数会代入文案，适合长输出的底部。 */
export const HiddenCount: Story = {
  render: (args) => <Controlled {...args} />,
  args: { hidden: 132 },
};

/** 文案完全可定制，读屏名称也随状态变化。 */
export const CustomLabels: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    hidden: 8,
    labels: {
      collapseAria: '隐藏多出来的日志',
      expandAria: (hidden: number) => `显示另外 ${hidden} 行日志`,
      collapse: '收起日志',
      expand: (hidden: number) => `还有 ${hidden} 行日志`,
    },
  },
};

/** 放在一段被截断的内容下方，模拟真实的折叠场景。 */
export const InContext: Story = {
  render: (args) => {
    const lines = Array.from({ length: 8 }, (_value, index) => `日志第 ${index + 1} 行`);
    return (
      <div style={{ width: 360 }}>
        <pre
          style={{
            margin: 0,
            padding: 12,
            font: '12px/20px var(--lumina-font-family-code)',
            color: 'var(--lumina-alias-label-secondary)',
            background: 'var(--lumina-alias-markdown-code-block)',
            borderRadius: 'var(--lumina-radius-md) var(--lumina-radius-md) 0 0',
          }}
        >
          {lines.slice(0, 3).join('\n')}
        </pre>
        <div style={{ padding: '0 12px', background: 'var(--lumina-alias-markdown-code-block)' }}>
          <Controlled {...args} hidden={5} />
        </div>
      </div>
    );
  },
};
