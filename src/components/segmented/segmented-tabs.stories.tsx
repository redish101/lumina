import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pill } from '../pill';
import { SegmentedTabs, type SegmentedTab, type SegmentedTabsProps } from './segmented-tabs';

/** 生成三个标签；`prefix` 保证同页多个示例的 DOM id 不冲突。 */
function makeItems(prefix: string): readonly [SegmentedTab<string>, ...SegmentedTab<string>[]] {
  return [
    { value: 'inbox', label: '收件箱', id: `${prefix}-inbox`, panelId: `${prefix}-inbox-panel` },
    {
      value: 'snoozed',
      label: '稍后处理',
      id: `${prefix}-snoozed`,
      panelId: `${prefix}-snoozed-panel`,
    },
    { value: 'done', label: '已完成', id: `${prefix}-done`, panelId: `${prefix}-done-panel` },
  ];
}

const BADGE_ITEMS = [
  {
    value: 'inbox',
    label: (
      <>
        收件箱 <Pill>12</Pill>
      </>
    ),
    id: 'badge-inbox',
    panelId: 'badge-inbox-panel',
  },
  {
    value: 'snoozed',
    label: (
      <>
        稍后处理 <Pill>3</Pill>
      </>
    ),
    id: 'badge-snoozed',
    panelId: 'badge-snoozed-panel',
  },
  {
    value: 'done',
    label: '已完成',
    id: 'badge-done',
    panelId: 'badge-done-panel',
  },
] as const;

/** 受控包装：标签栏只负责报告切换，面板与选中值都由使用方持有。 */
function TabsDemo({
  items,
  initialValue,
  label,
  size,
}: {
  items: SegmentedTabsProps['items'];
  initialValue: string;
  label: string;
  size?: 'sm' | 'md';
}) {
  const [value, setValue] = useState(initialValue);
  const selected = items.find((item) => item.value === value);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <SegmentedTabs items={items} value={value} onChange={setValue} label={label} size={size} />
      <div
        role="tabpanel"
        id={selected?.panelId}
        aria-labelledby={selected?.id}
        style={{
          minWidth: 280,
          padding: '12px 16px',
          borderRadius: 'var(--lumina-radius-md)',
          background: 'var(--lumina-alias-bg-module-platform)',
          color: 'var(--lumina-alias-label-secondary)',
          fontSize: 13,
        }}
      >
        当前面板：{value}
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/SegmentedTabs',
  component: SegmentedTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    items: makeItems('mail'),
    value: 'inbox',
    onChange: () => undefined,
    label: '邮箱视图',
    size: 'md',
  },
  argTypes: {
    items: {
      control: false,
      description:
        '非空且按顺序排列的标签，每项包含 `value`、`label`（任意节点）以及 `id`、`panelId`',
    },
    value: {
      control: false,
      description: '当前选中的值，必须属于 `items`；组件完全受控',
    },
    onChange: {
      control: false,
      description: '点击、左右方向键或 Home/End 请求切换时触发，键盘切换会同时移动焦点',
    },
    label: {
      control: 'text',
      description: 'tablist 的本地化可访问名称',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md'],
      description:
        '`sm` 标签高 30px、内边距 2px（总高 34px）；`md` 标签高 34px、内边距 4px（总高 42px）',
      table: { defaultValue: { summary: 'md' } },
    },
    className: {
      control: false,
      description: '追加在外层容器上的类名；面板由使用方自行渲染',
    },
  },
} satisfies Meta<typeof SegmentedTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认用法：等宽标签共用一块滑动指示器，切换后使用方按 `value` 渲染对应面板。 */
export const Default: Story = {
  render: (args) => (
    <TabsDemo items={args.items} initialValue={args.value} label={args.label} size={args.size} />
  ),
};

/** 标签内容可以是任意节点：在文案后嵌一个静态 Pill 即可显示未读数量。 */
export const WithBadge: Story = {
  render: (args) => (
    <TabsDemo items={BADGE_ITEMS} initialValue="inbox" label="带徽标的邮箱视图" size={args.size} />
  ),
};

/** 两种尺寸并排对比：`sm` 更紧凑，适合工具栏；`md` 适合页面级切换。 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'center' }}>
      <TabsDemo items={makeItems('sm')} initialValue="inbox" label="紧凑尺寸" size="sm" />
      <TabsDemo items={makeItems('md')} initialValue="inbox" label="默认尺寸" size="md" />
    </div>
  ),
};
