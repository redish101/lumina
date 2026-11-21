import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCheckOutline, IconChevronRightOutline, IconPlusOutline } from '../../icons';
import { Tabs, type TabItem, type TabsProps } from './tabs';

const ITEMS: TabItem[] = [
  { id: 'overview', label: '概览', badge: 3 },
  { id: 'members', label: '成员' },
  { id: 'billing', label: '账单', badge: 12 },
  { id: 'archived', label: '已归档', disabled: true },
];

/** 受控包装：选中值由使用方持有，下方自绘一个最简面板。 */
function TabsDemo({
  items,
  initialValue,
  variant,
  className,
  label,
}: {
  items: readonly TabItem[];
  initialValue: string;
  variant?: TabsProps['variant'];
  className?: string;
  label: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Tabs
        items={items}
        value={value}
        onChange={setValue}
        variant={variant}
        className={className}
        aria-label={label}
      />
      <div
        role="tabpanel"
        style={{
          minWidth: 320,
          padding: '12px 16px',
          borderRadius: 'var(--lumina-radius-md)',
          background: 'var(--lumina-alias-bg-module-platform)',
          color: 'var(--lumina-alias-label-secondary)',
          fontSize: 13,
        }}
      >
        当前面板：{value}（面板由使用方按 id 渲染）
      </div>
    </div>
  );
}

const ITEMS_WITH_ICONS: TabItem[] = [
  { id: 'overview', label: '概览', icon: <IconCheckOutline /> },
  { id: 'create', label: '新建', icon: <IconPlusOutline /> },
  { id: 'next', label: '下一步', icon: <IconChevronRightOutline /> },
];

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    items: ITEMS,
    defaultValue: 'overview',
    variant: 'underline',
    onChange: () => undefined,
    'aria-label': '项目视图',
  },
  argTypes: {
    items: {
      control: false,
      description:
        '按展示顺序排列的标签：`{ id, label, icon?, badge?, disabled? }`，`badge` 为数字时渲染成胶囊',
    },
    value: {
      control: false,
      description: '受控的选中 id；省略时组件自己持有选中值',
    },
    defaultValue: {
      control: 'text',
      description: '非受控模式的初始选中 id，缺省为第一个可用标签',
    },
    onChange: {
      control: false,
      description: '点击或键盘切换时触发；组件不渲染面板，由使用方按 id 自行渲染',
    },
    variant: {
      control: 'inline-radio',
      options: ['underline', 'pill'],
      description: '`underline` 用底部细线标示选中；`pill` 用一块滑动的浮起指示器',
      table: { defaultValue: { summary: 'underline' } },
    },
    className: {
      control: false,
      description: '追加在 tablist 上的类名，便于外部布局',
    },
    'aria-label': {
      control: 'text',
      description: 'tablist 的本地化可访问名称',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认的下划线变体：左右方向键切换并把焦点移到目标标签。 */
export const Default: Story = {
  render: (args) => (
    <TabsDemo
      items={args.items}
      initialValue={args.defaultValue ?? 'overview'}
      variant={args.variant}
      label={args['aria-label'] ?? '项目视图'}
    />
  ),
};

/** 胶囊变体：指示器按文案宽度测量，切换时用 transform 滑过去。 */
export const Pill: Story = {
  args: { variant: 'pill' },
  render: (args) => (
    <TabsDemo
      items={args.items}
      initialValue="overview"
      variant="pill"
      label={args['aria-label'] ?? '项目视图'}
    />
  ),
};

/** 徽标：数字渲染成小胶囊，也可以直接传任意节点（例如 Tag）。 */
export const WithBadge: Story = {
  render: (args) => (
    <TabsDemo items={ITEMS} initialValue="billing" variant={args.variant} label="带徽标的视图" />
  ),
};

/** 前置图标：图标尺寸由调用方决定，标签栏只保留 6px 间距。 */
export const WithIcons: Story = {
  render: () => <TabsDemo items={ITEMS_WITH_ICONS} initialValue="overview" label="带图标的视图" />,
};

/** 禁用项：不响应点击，方向键漫游时会被跳过。 */
export const Disabled: Story = {
  render: () => <TabsDemo items={ITEMS} initialValue="members" label="含禁用项的视图" />,
};

/** 两种变体并排对比，用来看指示器的对齐与过渡。 */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 28, justifyItems: 'start' }}>
      <TabsDemo items={ITEMS} initialValue="overview" label="下划线变体" />
      <TabsDemo items={ITEMS} initialValue="overview" variant="pill" label="胶囊变体" />
    </div>
  ),
};
