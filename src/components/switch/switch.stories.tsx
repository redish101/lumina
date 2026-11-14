import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Switch, type SwitchProps } from './switch';

/** Storybook 里用本地 state 包一层，让受控开关真的可以点。 */
function ControlledSwitch(props: SwitchProps) {
  const [checked, setChecked] = useState(props.checked);
  return <Switch {...props} checked={checked} onChange={setChecked} />;
}

const meta = {
  title: 'Components/Switch',
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    checked: false,
    label: 'Enable notifications',
    disabled: false,
    onChange: () => {},
  },
  argTypes: {
    checked: {
      control: 'boolean',
      description: '当前状态；组件完全受控，必须同时提供 `onChange`',
    },
    onChange: {
      control: false,
      description: '点击时回调请求切换到的状态',
    },
    label: {
      control: 'text',
      description: '可访问名称，必填，会渲染为 `aria-label`',
    },
    disabled: {
      control: 'boolean',
      description: '禁用后拒绝输入并降低透明度',
      table: { defaultValue: { summary: 'false' } },
    },
    title: {
      control: 'text',
      description: '悬浮提示，通常解释开关为何被锁定',
    },
    className: {
      control: false,
      description: '透传的类名，追加在开关自带的类名之后',
    },
    autoFocus: {
      control: 'boolean',
      description: '挂载且可用时是否自动获得焦点',
    },
    describedBy: {
      control: 'text',
      description: '描述该控件的元素 id，会渲染为 `aria-describedby`',
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认关闭态，点击滑块或轨道即可切换。 */
export const Default: Story = {
  render: (args) => <ControlledSwitch {...args} />,
};

/** 打开态：轨道变为品牌色，滑块右移 16px。 */
export const On: Story = {
  args: { checked: true },
  render: (args) => <ControlledSwitch {...args} />,
};

/** 禁用态（关闭）：透明度 50%，点击不再切换。 */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <ControlledSwitch {...args} />,
};

/** 禁用态（打开）：用来确认禁用样式在两种状态下都成立。 */
export const DisabledOn: Story = {
  args: { checked: true, disabled: true },
  render: (args) => <ControlledSwitch {...args} />,
};

/** 带悬浮提示：`title` 通常解释开关为何被锁定。 */
export const WithTitle: Story = {
  args: { title: 'Managed by your organization' },
  render: (args) => <ControlledSwitch {...args} />,
};

/** 自由开关：关闭态与打开态并排对比。 */
export const BothStates: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ControlledSwitch {...args} checked={false} label="Off" />
        <span>Off</span>
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ControlledSwitch {...args} checked={true} label="On" />
        <span>On</span>
      </label>
    </div>
  ),
};
