import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Menu, MenuItemButton, type MenuEntry } from './menu';
import { MenuGroup } from './menu-group';

const noop = (): void => {};

interface MenuDemoProps {
  /** 数据行条目。 */
  items: readonly MenuEntry[];
  /** 固定在底部的条目。 */
  footer?: readonly MenuEntry[] | undefined;
  /** 选中标记样式。 */
  selection?: 'check' | 'fill' | undefined;
  /** 初始选中行；打开后由点击更新。 */
  defaultSelectedId?: string | undefined;
  /** 是否 portal 到 body。 */
  portal?: boolean | undefined;
  /** 紧凑行高。 */
  dense?: boolean | undefined;
  /** 紧凑内边距。 */
  compact?: boolean | undefined;
  /** 相对锚点的对齐方式。 */
  align?: 'start' | 'end' | undefined;
  /** 打开时聚焦第一行。 */
  autoFocus?: boolean | undefined;
  /** 子页面返回行的文案。 */
  submenuBackLabel?: string | undefined;
  /** 指针离开后是否延迟关闭。 */
  closeOnPointerLeave?: boolean | undefined;
  /** 触发器文案。 */
  triggerLabel?: string;
  /** 组件行；参数为关闭菜单的函数。 */
  children?: (close: () => void) => ReactNode;
}

/**
 * 真实可开合的例子：触发器就是一个普通按钮，抛出 `returnFocus` 后，
 * Escape、外部点击或选中后焦点都会回到它上面。
 */
function MenuDemo({
  items,
  footer,
  selection,
  defaultSelectedId,
  portal,
  dense,
  compact,
  align,
  autoFocus,
  submenuBackLabel,
  closeOnPointerLeave,
  triggerLabel = '打开菜单',
  children,
}: MenuDemoProps) {
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(defaultSelectedId ?? null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = (): void => setOpen(false);
  return (
    <Menu
      open={open}
      onClose={close}
      returnFocus={() => triggerRef.current}
      items={items}
      footer={footer}
      selectedId={selectedId ?? undefined}
      selection={selection}
      portal={portal}
      dense={dense}
      compact={compact}
      align={align}
      autoFocus={autoFocus}
      submenuBackLabel={submenuBackLabel}
      closeOnPointerLeave={closeOnPointerLeave}
      onSelect={(id) => {
        setSelectedId(id);
        setOpen(false);
      }}
      anchor={
        <Button
          ref={triggerRef}
          variant="outline"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {triggerLabel}
        </Button>
      }
    >
      {children?.(close)}
    </Menu>
  );
}

const BASIC_ITEMS: readonly MenuEntry[] = [
  { id: 'new-file', label: '新建文件' },
  { id: 'open-folder', label: '打开文件夹…' },
  { type: 'separator', id: 'basic-separator' },
  { id: 'save', label: '保存' },
];

const SHORTCUT_ITEMS: readonly MenuEntry[] = [
  { id: 'new-file', label: '新建文件', shortcut: { keys: ['⌘', 'N'], aria: 'Meta+N' } },
  { id: 'open-folder', label: '打开文件夹…', shortcut: { keys: ['⌘', 'O'], aria: 'Meta+O' } },
  { id: 'save', label: '保存', shortcut: { keys: ['⌘', 'S'], aria: 'Meta+S' } },
  { type: 'separator', id: 'shortcut-separator' },
  {
    id: 'command-palette',
    label: '命令面板',
    shortcut: { keys: ['⌘', '⇧', 'P'], aria: 'Meta+Shift+P' },
  },
  { id: 'unavailable', label: '当前不可用的动作', disabled: true },
];

const SUBMENU_ITEMS: readonly MenuEntry[] = [
  {
    id: 'export',
    label: '导出',
    submenu: [
      { id: 'export-png', label: 'PNG 图片' },
      { id: 'export-svg', label: 'SVG 矢量图' },
      { id: 'export-pdf', label: 'PDF 文档' },
    ],
  },
  {
    id: 'share',
    label: '分享',
    submenu: [
      { id: 'share-link', label: '复制链接' },
      { id: 'share-team', label: '邀请团队成员…' },
    ],
  },
  { type: 'separator', id: 'submenu-separator' },
  { id: 'reveal', label: '在文件夹中显示' },
];

const GROUP_ITEMS: readonly MenuEntry[] = [
  { type: 'label', id: 'view-label', text: '视图' },
  { id: 'view-list', label: '列表', icon: <ViewListIcon /> },
  { id: 'view-grid', label: '网格', icon: <ViewGridIcon /> },
  { type: 'separator', id: 'group-separator' },
  { type: 'label', id: 'sort-label', text: '排序' },
  { id: 'sort-name', label: '名称' },
  { id: 'sort-date', label: '修改日期' },
  { id: 'sort-size', label: '大小' },
  { type: 'separator', id: 'danger-separator' },
  { id: 'delete', label: '删除', danger: true },
];

const LONG_ITEMS: readonly MenuEntry[] = Array.from({ length: 40 }, (_, index) => ({
  id: `long-item-${index}`,
  label: `菜单项 ${index + 1}`,
}));

/** 演示用的行内图标；真实项目里换成图标库组件即可。 */
function ViewListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01" strokeLinecap="round" />
    </svg>
  );
}

/** 演示用的行内图标；真实项目里换成图标库组件即可。 */
function ViewGridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </svg>
  );
}

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    open: false,
    anchor: null,
    onClose: noop,
  },
  argTypes: {
    open: {
      control: 'boolean',
      description: '是否展开；关闭时列表整块不渲染，是否归还焦点由 `returnFocus` 决定',
    },
    anchor: {
      control: false,
      description: '锚点内容（触发器），渲染在带 `anchor-name` 的外层容器内',
    },
    items: {
      control: false,
      description:
        "数据行条目：可选中行、`{ type: 'separator' }` 分隔线与 `{ type: 'label' }` 标题",
    },
    children: {
      control: false,
      description: '组件行内容，追加在数据行之后，可用 `MenuItemButton` 与 `MenuGroup` 组合',
    },
    footer: {
      control: false,
      description: '固定在卡片底部、滚动区域之外的条目',
    },
    submenuBackLabel: {
      control: 'text',
      description: '子页面里返回动作的文案；省略时用父行文案加一个返回箭头',
    },
    selectedId: {
      control: 'text',
      description: '单选时当前行的 id，在行尾渲染对勾（或整行填充）',
    },
    selectedIds: {
      control: false,
      description: '多选时当前行的 id 列表，优先级与 `selectedId` 相同',
    },
    onSelect: {
      control: false,
      description: '行被激活（点击、Enter、聚焦行上按 Tab）时回调行 id；关闭菜单仍是持有方的决定',
    },
    onClose: {
      control: false,
      description: '请求关闭（Escape、Tab、选中、外部点击等）时调用',
    },
    align: {
      control: 'inline-radio',
      options: ['start', 'end'],
      description: '相对锚点的水平对齐方式',
      table: { defaultValue: { summary: 'start' } },
    },
    side: {
      control: 'inline-radio',
      options: ['bottom', 'top', 'right'],
      description: '相对锚点展开的方向',
      table: { defaultValue: { summary: 'bottom' } },
    },
    portal: {
      control: 'boolean',
      description: '是否把列表 portal 到 `document.body`（用于会被 `overflow` 裁切的容器）',
      table: { defaultValue: { summary: 'false' } },
    },
    closeOnPointerLeave: {
      control: 'boolean',
      description: '指针离开整个菜单区域后，200ms 宽限期内不返回则关闭',
      table: { defaultValue: { summary: 'false' } },
    },
    dense: {
      control: 'boolean',
      description: '紧凑行高，长列表里能放更多行',
      table: { defaultValue: { summary: 'false' } },
    },
    compact: {
      control: 'boolean',
      description: '更紧凑的卡片内边距',
      table: { defaultValue: { summary: 'false' } },
    },
    autoFocus: {
      control: 'boolean',
      description: '打开时是否聚焦第一行（不设置则焦点留在触发器上）',
      table: { defaultValue: { summary: 'false' } },
    },
    selection: {
      control: 'inline-radio',
      options: ['check', 'fill'],
      description: '选中标记：行尾对勾，或整行使用选中填充',
      table: { defaultValue: { summary: 'check' } },
    },
    anchorRef: {
      control: false,
      description: '外部锚点元素引用：提供时列表锚定到该元素，而不是外层容器',
    },
    anchorPoint: {
      control: false,
      description: '本次打开时捕获的客户端坐标，用于右键或指针定位的菜单',
    },
    minWidthFromAnchor: {
      control: 'boolean',
      description: 'portal 时列表是否至少与锚点等宽',
      table: { defaultValue: { summary: 'false' } },
    },
    className: {
      control: false,
      description: '追加在外层容器上的类名',
    },
    listClassName: {
      control: false,
      description: '追加在卡片上的类名',
    },
    contextual: {
      control: 'boolean',
      description: '指针定位的右键菜单模式：留白、分组图标对齐与右键关闭',
      table: { defaultValue: { summary: 'false' } },
    },
    exiting: {
      control: false,
      description: '关闭动画阶段：`dismiss` 淡出，`replace` 直接替换成下一份内容',
    },
    returnFocus: {
      control: false,
      description: '返回关闭后应获得焦点的触发器；锚点从未获得焦点时退回锚点的第一个按钮',
    },
    isExternalTrigger: {
      control: false,
      description: '判断某个节点是否属于外部触发器（它的点击不触发外部点击关闭）',
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 点击按钮打开的基本菜单：条目来自 `items`，选中后更新行尾对勾并关闭。 */
export const Default: Story = {
  render: () => <MenuDemo items={BASIC_ITEMS} defaultSelectedId="save" triggerLabel="文件" />,
};

/** 带快捷键的条目：`shortcut.keys` 渲染键帽，`shortcut.aria` 供辅助技术朗读组合。 */
export const WithShortcuts: Story = {
  render: () => <MenuDemo items={SHORTCUT_ITEMS} triggerLabel="编辑" />,
};

/** 悬停或 ArrowRight 打开二级子菜单；点击父行则进入单面板子页面。 */
export const WithSubmenu: Story = {
  render: () => <MenuDemo items={SUBMENU_ITEMS} submenuBackLabel="返回" triggerLabel="更多操作" />,
};

/** 分组标题、分隔线与单选项：`selectedId` 控制行尾对勾，点击后移动到新行。 */
export const WithGroups: Story = {
  render: () => (
    <MenuDemo
      items={GROUP_ITEMS}
      defaultSelectedId="view-list"
      triggerLabel="视图选项"
      selection="check"
    />
  ),
};

/** 条目很多时卡片在视口内滚动，标题与底栏分别固定在卡片顶部与底部。 */
export const LongList: Story = {
  render: () => (
    <MenuDemo
      items={LONG_ITEMS}
      dense
      footer={[{ id: 'close-menu', label: '关闭菜单' }]}
      triggerLabel="长列表"
    />
  ),
};

/** 用 `MenuGroup` + `MenuItemButton` 组合组件行：分组标题由 `MenuGroup` 提供，行仍参与键盘漫游。 */
export const WithMenuGroup: Story = {
  render: () => (
    <MenuDemo
      items={[]}
      triggerLabel="组件行"
      children={(close) => (
        <>
          <MenuGroup label="文件">
            <MenuItemButton onSelect={close} shortcut={{ keys: ['⌘', 'N'], aria: 'Meta+N' }}>
              新建文件
            </MenuItemButton>
            <MenuItemButton onSelect={close} shortcut={{ keys: ['⌘', 'S'], aria: 'Meta+S' }}>
              保存
            </MenuItemButton>
          </MenuGroup>
          <MenuGroup label="帮助">
            <MenuItemButton onSelect={close}>文档</MenuItemButton>
            <MenuItemButton onSelect={close} disabled disabledReason="当前版本没有此功能">
              反馈问题
            </MenuItemButton>
          </MenuGroup>
        </>
      )}
    />
  ),
};
