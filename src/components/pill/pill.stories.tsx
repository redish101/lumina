import type { Meta, StoryObj } from '@storybook/react-vite';
import { Pill } from './pill';

const meta = {
  title: 'Components/Pill',
  component: Pill,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Pill',
    active: false,
  },
  argTypes: {
    active: {
      control: 'boolean',
      description: '选中/激活的视觉状态，只改变配色，不改变行为',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      control: 'text',
      description: '胶囊内的文案或内容',
    },
    className: {
      control: false,
      description: '透传的类名，追加在组件自带的类名之后',
    },
    onClick: {
      control: false,
      description: '传入后渲染为可点击的 `<button>`；不传则渲染为静态 `<span>`',
    },
    disabled: {
      control: 'boolean',
      description: '仅在可交互（渲染为 button）时生效，禁用后不可点击',
    },
  },
} satisfies Meta<typeof Pill>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认形态：不传 `onClick`，渲染为只读的静态胶囊。 */
export const Default: Story = {};

/** 传入 `onClick` 后渲染为按钮，有 hover 反馈和指针光标。 */
export const Interactive: Story = {
  args: { children: 'Clickable', onClick: () => {} },
};

/** 激活态：更亮的文字、浅色填充和 1px 内描边。 */
export const Active: Story = {
  args: { children: 'Active', active: true, onClick: () => {} },
};

/** 只读的激活态：没有 `onClick` 时仍然只是 `<span>`，仅展示选中配色。 */
export const ActiveReadOnly: Story = {
  args: { children: 'Selected', active: true },
};

/** 禁用态：透明度降低、指针变为禁用，且 hover 样式不再生效。 */
export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true, onClick: () => {} },
};

/** 一组筛选胶囊：同一时刻只有一个处于激活态，用来对比默认与选中外观。 */
export const Group: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 8 }}>
      {['All', 'Running', 'Done'].map((label) => (
        <Pill {...args} key={label} active={label === 'Running'} onClick={() => {}}>
          {label}
        </Pill>
      ))}
    </div>
  ),
};
