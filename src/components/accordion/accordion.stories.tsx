import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, type AccordionItem } from './accordion';

const ITEMS: AccordionItem[] = [
  {
    id: 'profile',
    title: '个人资料',
    content: <p style={{ margin: 0 }}>修改头像、昵称与联系方式，保存后立即生效。</p>,
  },
  {
    id: 'security',
    title: '账号安全',
    content: <p style={{ margin: 0 }}>开启两步验证，并定期检查最近的登录设备。</p>,
  },
  {
    id: 'notification',
    title: '通知偏好',
    content: <p style={{ margin: 0 }}>选择通过邮件、站内信还是桌面推送接收更新。</p>,
  },
  {
    id: 'billing',
    title: '账单与发票',
    content: <p style={{ margin: 0 }}>查看历史账单，下载 PDF 发票或更新付款方式。</p>,
  },
];

const ITEMS_WITH_DISABLED: AccordionItem[] = [
  ...ITEMS.slice(0, 2),
  {
    id: 'advanced',
    title: '高级设置（需要管理员权限）',
    content: <p style={{ margin: 0 }}>仅工作区管理员可以修改这些选项。</p>,
    disabled: true,
  },
  ITEMS[3]!,
];

/** 受控包装：展开项由使用方持有，并在下方回显当前值。 */
function ControlledAccordion() {
  const [openIds, setOpenIds] = useState<string[]>(['profile']);
  return (
    <div style={{ display: 'grid', gap: 12, width: 420 }}>
      <Accordion items={ITEMS} value={openIds} onChange={setOpenIds} multiple />
      <code style={{ color: 'var(--lumina-alias-label-tertiary)', fontSize: 12 }}>
        value = {JSON.stringify(openIds)}
      </code>
    </div>
  );
}

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    items: ITEMS,
    defaultValue: ['profile'],
    multiple: false,
    onChange: () => undefined,
  },
  argTypes: {
    items: {
      control: false,
      description: '折叠项列表：`{ id, title, content, disabled? }`，`content` 可以是任意节点',
    },
    value: {
      control: false,
      description: '受控的展开 id 列表；提供时组件不再自行维护状态',
    },
    defaultValue: {
      control: 'object',
      description: '非受控模式的初始展开列表，默认全部收起',
    },
    onChange: {
      control: false,
      description: '展开或收起后触发，参数是新的展开 id 列表',
    },
    multiple: {
      control: 'boolean',
      description: '是否允许同时展开多项；默认一次只展开一项',
      table: { defaultValue: { summary: 'false' } },
    },
    className: {
      control: false,
      description: '追加在最外层容器上的类名，便于控制宽度',
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认一次只展开一项；打开新项会自动收起上一项。 */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 420 }}>
      <Accordion {...args} />
    </div>
  ),
};

/** 同时展开多项：`multiple` 打开后，每次点击只增删自己。 */
export const Multiple: Story = {
  args: { multiple: true, defaultValue: ['profile', 'security'] },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Accordion {...args} />
    </div>
  ),
};

/** 非受控的初始展开：`defaultValue` 只影响首屏，之后由组件内部维护。 */
export const DefaultOpen: Story = {
  args: { defaultValue: ['profile', 'notification'], multiple: true },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Accordion {...args} />
    </div>
  ),
};

/** 受控用法：展开列表完全由使用方持有，方便与路由或表单联动。 */
export const Controlled: Story = {
  render: () => <ControlledAccordion />,
};

/** 禁用项无法展开，Tab 与方向键漫游都会跳过它。 */
export const Disabled: Story = {
  args: { items: ITEMS_WITH_DISABLED, defaultValue: ['security'] },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Accordion {...args} />
    </div>
  ),
};

/** 内容可以是任意节点：列表、按钮、代码块都会跟随高度动画一起展开。 */
export const RichContent: Story = {
  args: {
    defaultValue: ['rich'],
    multiple: true,
    items: [
      {
        id: 'rich',
        title: '这个月发生了什么',
        content: (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>发布 3 个新组件</li>
            <li>修复 12 个问题</li>
            <li>文档站点完成改版</li>
          </ul>
        ),
      },
      {
        id: 'empty',
        title: '空内容也不会塌陷',
        content: <p style={{ margin: 0 }}>内容为空时展开高度同样平滑变化。</p>,
      },
      ITEMS[1]!,
    ],
  },
  render: (args) => (
    <div style={{ width: 420 }}>
      <Accordion {...args} />
    </div>
  ),
};
