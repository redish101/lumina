import { useState, type CSSProperties } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCheckCircleOutline, IconCheckOutline, IconPlusOutline } from '../../icons';
import { Button } from '../button';
import { Sidebar, type SidebarItem, type SidebarProps, type SidebarSection } from './sidebar';

const PRIMARY_ITEMS: SidebarItem[] = [
  { id: 'all', label: '全部任务', icon: <IconCheckCircleOutline size={16} />, badge: 6 },
  { id: 'inbox', label: '收件箱', icon: <IconPlusOutline size={16} />, badge: 3 },
  { id: 'done', label: '已完成', icon: <IconCheckOutline size={16} /> },
];

const SECTIONS: SidebarSection[] = [
  {
    title: '标签',
    items: [
      { id: 'work', label: '工作', badge: 4 },
      { id: 'personal', label: '个人' },
      { id: 'shopping', label: '购物', badge: 2 },
    ],
  },
  {
    title: '项目',
    items: [
      { id: 'lumina', label: 'Lumina 组件库' },
      { id: 'website', label: '官网改版' },
    ],
  },
];

const LINK_ITEMS: SidebarItem[] = [
  { id: 'all', label: '全部任务', icon: <IconCheckCircleOutline size={16} />, href: '#all' },
  { id: 'inbox', label: '收件箱', icon: <IconPlusOutline size={16} />, href: '#inbox', badge: 3 },
  { id: 'done', label: '已完成', icon: <IconCheckOutline size={16} />, href: '#done' },
];

const frameStyle: CSSProperties = {
  display: 'flex',
  height: 560,
  overflow: 'hidden',
  background: 'var(--lumina-alias-bg-layer-1)',
  border: '1px solid var(--lumina-alias-border-l2)',
  borderRadius: 'var(--lumina-radius-lg)',
};

const contentStyle: CSSProperties = {
  flex: 1,
  padding: 32,
  color: 'var(--lumina-alias-label-secondary)',
  fontSize: 14,
  lineHeight: 1.6,
};

/** 演示包装：维护选中项，并给侧栏留出一块内容区观察宽度变化。 */
function SidebarDemo(props: Omit<SidebarProps, 'activeId' | 'onSelect'>) {
  const [activeId, setActiveId] = useState('all');

  return (
    <div style={frameStyle}>
      <Sidebar {...props} activeId={activeId} onSelect={setActiveId} />
      <div style={contentStyle}>
        <p style={{ margin: 0 }}>当前选中：{activeId}</p>
      </div>
    </div>
  );
}

/** 受控折叠：折叠状态由外部 state 管理，也可以从内容区触发切换。 */
function ControlledSidebarDemo() {
  const [activeId, setActiveId] = useState('all');
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={frameStyle}>
      <Sidebar
        header={<strong>Lumina</strong>}
        items={PRIMARY_ITEMS}
        sections={SECTIONS}
        footer={<span>已保存</span>}
        activeId={activeId}
        onSelect={setActiveId}
        collapsible
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <div style={contentStyle}>
        <p style={{ margin: '0 0 12px' }}>受控折叠：{collapsed ? '已折叠' : '已展开'}</p>
        <Button onClick={() => setCollapsed((current) => !current)}>从外部切换</Button>
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '数据驱动的侧边导航：支持顶层条目、分组、徽标、链接与折叠。' +
          '折叠时文案在视觉上隐藏，但仍保留可访问名称，图标保持居中。',
      },
    },
  },
  args: {
    header: <strong>Lumina</strong>,
    items: PRIMARY_ITEMS,
    sections: SECTIONS,
    footer: <span>已保存</span>,
    collapsible: false,
    defaultCollapsed: false,
    width: 248,
    collapsedWidth: 64,
  },
  argTypes: {
    items: {
      control: false,
      description: '顶层条目列表',
    },
    sections: {
      control: false,
      description: '可选分组，渲染在顶层条目之后',
    },
    activeId: {
      control: false,
      description: '当前选中条目的 id',
    },
    onSelect: {
      control: false,
      description: '选中条目时调用，参数为条目 id',
    },
    header: {
      control: false,
      description: '顶部自定义内容',
    },
    footer: {
      control: false,
      description: '底部自定义内容',
    },
    collapsible: {
      control: 'boolean',
      description: '是否渲染底部的折叠按钮',
    },
    collapsed: {
      control: false,
      description: '受控折叠状态',
    },
    defaultCollapsed: {
      control: 'boolean',
      description: '非受控模式下的初始折叠状态',
    },
    onCollapsedChange: {
      control: false,
      description: '折叠状态变化时调用，便于受控使用',
    },
    width: {
      control: { type: 'number', min: 200, max: 360, step: 4 },
      description: '展开时的宽度（px），默认 248',
    },
    collapsedWidth: {
      control: { type: 'number', min: 48, max: 96, step: 4 },
      description: '折叠时的宽度（px），默认 64',
    },
    className: {
      control: false,
      description: '追加到最外层 nav 的类名',
    },
  },
  render: (args) => <SidebarDemo {...args} />,
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认结构：顶部标题、逻辑视图、分组标签与底部状态。 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: '包含顶部 header、顶层条目、两个分组和底部 footer 的完整侧栏。',
      },
    },
  },
};

/** 打开底部折叠按钮，点击后在 248px 与 64px 之间切换。 */
export const Collapsible: Story = {
  args: {
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: '`collapsible` 会在底部渲染带 `aria-expanded` 的折叠按钮，宽度过渡可配置。',
      },
    },
  },
};

/** 初始即折叠：只显示居中图标，文案保留在无障碍树中。 */
export const CollapsedByDefault: Story = {
  args: {
    collapsible: true,
    defaultCollapsed: true,
    header: <IconCheckCircleOutline size={20} />,
  },
  parameters: {
    docs: {
      description: {
        story: '`defaultCollapsed` 控制非受控初始状态；折叠后图标居中，条目名称仍然可读。',
      },
    },
  },
};

/** 条目带 href 时渲染为链接，选中项使用 aria-current="page"。 */
export const LinkItems: Story = {
  args: {
    items: LINK_ITEMS,
    sections: undefined,
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: '传入 `href` 的条目会渲染成 `<a>`，适合与路由库配合；选中项带 `aria-current`。',
      },
    },
  },
};

/** 自定义展开与折叠宽度，适合更宽的导航内容。 */
export const CustomWidth: Story = {
  args: {
    width: 300,
    collapsedWidth: 80,
    collapsible: true,
  },
  parameters: {
    docs: {
      description: {
        story: '通过 `width` 与 `collapsedWidth` 调整两种宽度，过渡仍然由 CSS 控制。',
      },
    },
  },
};

/** 受控折叠：外部按钮与侧栏按钮共享同一份折叠状态。 */
export const ControlledCollapse: Story = {
  render: () => <ControlledSidebarDemo />,
  parameters: {
    docs: {
      description: {
        story: '传入 `collapsed` 与 `onCollapsedChange` 后，折叠状态完全由调用方管理。',
      },
    },
  },
};
