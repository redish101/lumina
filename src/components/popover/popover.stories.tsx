import { useState } from 'react';
import type { ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Popover, type PopoverAlign, type PopoverSide } from './popover';

function Panel({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gap: 8, width: 200 }}>{children}</div>;
}

const SIDES: PopoverSide[] = ['top', 'bottom', 'left', 'right'];
const ALIGNS: PopoverAlign[] = ['start', 'center', 'end'];

/** 受控包装：打开状态由使用方持有，便于和抽屉、路由等联动。 */
function ControlledPopover() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <Popover
        open={open}
        onOpenChange={setOpen}
        content={
          <Panel>
            <strong style={{ fontSize: 13 }}>受控浮层</strong>
            <span style={{ color: 'var(--lumina-alias-label-secondary)' }}>
              打开状态完全由外部持有。
            </span>
          </Panel>
        }
      >
        <Button variant="outline">受控打开</Button>
      </Popover>
      <code style={{ color: 'var(--lumina-alias-label-tertiary)', fontSize: 12 }}>
        open = {String(open)}
      </code>
    </div>
  );
}

const meta = {
  title: 'Components/Popover',
  component: Popover,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    side: 'bottom',
    align: 'start',
    offset: 8,
    closeOnOutsideClick: true,
    closeOnEsc: true,
    onOpenChange: () => undefined,
    content: (
      <Panel>
        <strong style={{ fontSize: 13 }}>浮层内容</strong>
        <span style={{ color: 'var(--lumina-alias-label-secondary)' }}>
          点击外部或按 Esc 关闭，焦点会回到触发器。
        </span>
      </Panel>
    ),
    children: <Button variant="outline">打开浮层</Button>,
  },
  argTypes: {
    content: {
      control: false,
      description: '浮层内容，可以是任意节点',
    },
    children: {
      control: false,
      description: '单个触发器元素；组件会包一层 span 承接 ref 与点击，并注入 aria 属性',
    },
    side: {
      control: 'inline-radio',
      options: SIDES,
      description: '首选方位；空间不足时翻转到对侧',
      table: { defaultValue: { summary: 'bottom' } },
    },
    align: {
      control: 'inline-radio',
      options: ALIGNS,
      description: '与触发器在交叉轴上的对齐方式',
      table: { defaultValue: { summary: 'start' } },
    },
    offset: {
      control: 'number',
      description: '浮层与触发器的间距（px）',
      table: { defaultValue: { summary: '8' } },
    },
    open: {
      control: false,
      description: '受控的打开状态；省略时组件自己持有',
    },
    defaultOpen: {
      control: 'boolean',
      description: '非受控模式的初始打开状态',
    },
    onOpenChange: {
      control: false,
      description: '打开状态变化时触发',
    },
    closeOnOutsideClick: {
      control: 'boolean',
      description: '点击浮层与触发器之外的位置是否关闭',
      table: { defaultValue: { summary: 'true' } },
    },
    closeOnEsc: {
      control: 'boolean',
      description: '按 Esc 是否关闭并把焦点归还触发器',
      table: { defaultValue: { summary: 'true' } },
    },
    className: {
      control: false,
      description: '追加在浮层面板上的类名',
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认从下方展开、左对齐；面板打开后焦点进入内容。 */
export const Default: Story = {
  render: (args) => <Popover {...args} />,
};

/** 四个方位各放一个，靠近视口边缘时会自动翻转到空间更宽的一侧。 */
export const Sides: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 160px)',
        gap: 56,
        placeItems: 'center',
      }}
    >
      {SIDES.map((side) => (
        <Popover
          key={side}
          side={side}
          content={
            <Panel>
              <strong style={{ fontSize: 13 }}>side = {side}</strong>
              <span style={{ color: 'var(--lumina-alias-label-secondary)' }}>
                空间不足时会翻转到对侧。
              </span>
            </Panel>
          }
        >
          <Button variant="outline">{side}</Button>
        </Popover>
      ))}
    </div>
  ),
};

/** 交叉轴对齐：start / center / end 只影响另一个轴。 */
export const Align: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      {ALIGNS.map((align) => (
        <Popover
          key={align}
          align={align}
          content={
            <Panel>
              <strong style={{ fontSize: 13 }}>align = {align}</strong>
              <span style={{ color: 'var(--lumina-alias-label-secondary)' }}>
                浮层随触发器位置测量后定位。
              </span>
            </Panel>
          }
        >
          <Button variant="outline">{align}</Button>
        </Popover>
      ))}
    </div>
  ),
};

/** 受控用法：`open` 与 `onOpenChange` 成对使用，状态由外部持有。 */
export const Controlled: Story = {
  render: () => <ControlledPopover />,
};

/** 关闭外部点击与 Esc 后，只能再次点击触发器收起。 */
export const Persistent: Story = {
  args: { closeOnOutsideClick: false, closeOnEsc: false },
  render: (args) => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <Popover {...args} />
      <span style={{ color: 'var(--lumina-alias-label-tertiary)', fontSize: 12 }}>
        此示例不会响应外部点击或 Esc。
      </span>
    </div>
  ),
};

/** 内容超过视口高度时面板自己滚动，不会被裁掉。 */
export const Scrollable: Story = {
  render: (args) => (
    <Popover
      {...args}
      content={
        <div style={{ display: 'grid', gap: 8, width: 220 }}>
          {Array.from({ length: 24 }, (_, index) => (
            <span key={index} style={{ color: 'var(--lumina-alias-label-secondary)' }}>
              第 {index + 1} 行：面板高度受视口限制，内容内部滚动。
            </span>
          ))}
        </div>
      }
    >
      <Button variant="outline">很长的内容</Button>
    </Popover>
  ),
};
