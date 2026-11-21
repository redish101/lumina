import type { ComponentProps } from 'react';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCheckCircleOutline, IconLoadingOutline } from '../../icons';
import { DisclosureRow } from './disclosure-row';

const meta = {
  title: 'Components/DisclosureRow',
  component: DisclosureRow,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '一行可展开的摘要：左侧图标或箭头负责切换，标题支持运行中的扫光，' +
          '展开后内容区做高度过渡。展开状态完全受控，适合承载工具调用、步骤等详情。',
      },
    },
  },
  args: {
    icon: <IconCheckCircleOutline />,
    title: '执行详情',
    open: false,
    expandable: true,
    onToggle: () => {},
    collapsedContent: '3 个步骤',
  },
  argTypes: {
    icon: { control: false, description: '收起状态下的前置图标' },
    title: { control: 'text', description: '摘要标题' },
    open: { control: 'boolean', description: '是否展开（受控）' },
    expandable: { control: 'boolean', description: '是否允许展开' },
    onToggle: { action: 'toggled', description: '切换展开状态' },
    running: { control: 'boolean', description: '标题是否播放进行中动画' },
    expandOnRowClick: { control: 'boolean', description: '是否点击整行切换' },
    previewChevron: { control: 'boolean', description: '收起时悬停用箭头替换图标' },
    keepContentWhenOpen: { control: 'boolean', description: '展开时是否保留摘要内容' },
    collapsedContent: { control: false, description: '标题旁的摘要内容' },
    headerAccessory: { control: false, description: '行尾附加操作' },
    children: { control: false, description: '展开后的内容' },
  },
} satisfies Meta<typeof DisclosureRow>;

export default meta;
type Story = StoryObj<typeof meta>;

function Controlled({
  initialOpen = false,
  ...args
}: ComponentProps<typeof DisclosureRow> & { initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);
  return <DisclosureRow {...args} open={open} onToggle={() => setOpen((value) => !value)} />;
}

const details = (
  <div style={{ fontSize: 12, lineHeight: '20px', color: 'var(--lumina-alias-label-secondary)' }}>
    读取 <code>src/components/button/button.tsx</code>
    <br />
    检查导出与样式令牌，共 3 个文件。
  </div>
);

/** 默认收起，点击左侧箭头展开。 */
export const Collapsed: Story = {
  render: (args) => <Controlled {...args} />,
};

/** 初始展开，内容区常驻可见。 */
export const Expanded: Story = {
  render: (args) => <Controlled {...args} initialOpen />,
  args: { children: details },
};

/** 标题旁显示步骤数摘要，展开后摘要默认隐藏。 */
export const WithSummary: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    title: '分析工作区',
    collapsedContent: '5 个文件 · 2 个错误',
    children: details,
  },
};

/** 行尾可以放耗时、状态等附加信息。 */
export const HeaderAccessory: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    title: '运行类型检查',
    collapsedContent: undefined,
    headerAccessory: (
      <span style={{ fontSize: 11, color: 'var(--lumina-alias-label-tertiary)' }}>12.4s</span>
    ),
    children: details,
  },
};

/** 点击整行即可切换，行本身获得按钮语义。 */
export const RowClick: Story = {
  render: (args) => <Controlled {...args} />,
  args: {
    title: '点击整行展开',
    expandOnRowClick: true,
    collapsedContent: undefined,
    children: details,
  },
};

/** 运行中标题带扫光，收起时悬停图标会变成折叠箭头。 */
export const Running: Story = {
  render: (args) => <Controlled {...args} initialOpen />,
  args: {
    icon: <IconLoadingOutline />,
    title: '正在读取文件…',
    running: true,
    previewChevron: true,
    collapsedContent: '进行中',
    children: details,
  },
};
