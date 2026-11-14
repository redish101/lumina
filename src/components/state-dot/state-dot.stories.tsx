import type { Meta, StoryObj } from '@storybook/react-vite';
import { StateDot, type StateDotState } from './state-dot';

const STATES: StateDotState[] = ['done', 'warning', 'ongoing', 'error', 'idle'];

const meta = {
  title: 'Components/StateDot',
  component: StateDot,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    state: 'done',
  },
  argTypes: {
    state: {
      control: 'inline-radio',
      options: STATES,
      description:
        '状态语义：`done` 完成、`warning` 需关注、`ongoing` 进行中、`error` 失败、`idle` 空闲',
    },
    size: {
      control: 'number',
      description: '外径（px）；缺省时 ongoing 为 14，其余为 10',
    },
    className: {
      control: false,
      description: '透传的类名，用来做外部布局',
    },
    appearance: {
      control: 'inline-radio',
      options: ['dot', 'step'],
      description: '`dot` 紧凑圆点；`step` 为步骤条样式，done 显示实心对勾',
      table: { defaultValue: { summary: 'dot' } },
    },
  },
} satisfies Meta<typeof StateDot>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 完成：绿色实心圆点。 */
export const Done: Story = {
  args: { state: 'done' },
};

/** 警告：琥珀色实心圆点，表示需要用户关注。 */
export const Warning: Story = {
  args: { state: 'warning' },
};

/** 进行中：14px 的旋转圆环加呼吸弧，持续动画。 */
export const Ongoing: Story = {
  args: { state: 'ongoing' },
};

/** 错误：红色实心圆点。 */
export const Error: Story = {
  args: { state: 'error' },
};

/** 空闲：中性灰实心圆点，表示被跟踪对象当前没有活动。 */
export const Idle: Story = {
  args: { state: 'idle' },
};

/** 大尺寸：`size` 同时控制外径与内部核心的绘制。 */
export const Large: Story = {
  args: { state: 'ongoing', size: 24 },
};

/** 全部状态并排，一行看完五种语义。 */
export const AllStates: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      {STATES.map((state) => (
        <span key={state} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <StateDot {...args} state={state} />
          <span>{state}</span>
        </span>
      ))}
    </div>
  ),
};

/** 步骤外观：完成（实心对勾）、错误（实心红点）、警告（空心描边）与待办（空心圆）。 */
export const StepAppearance: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <StateDot {...args} appearance="step" state="done" size={16} />
      <StateDot {...args} appearance="step" state="error" size={16} />
      <StateDot {...args} appearance="step" state="warning" size={16} />
      <StateDot {...args} appearance="step" state="idle" size={16} />
    </div>
  ),
};
