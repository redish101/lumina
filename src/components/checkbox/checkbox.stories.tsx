import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox, type CheckboxProps } from './checkbox';

/** 受控演示：组件自身只管把用户点击变成 onChange，状态留在外部。 */
function CheckboxDemo(props: CheckboxProps) {
  const [checked, setChecked] = useState(props.checked);
  return <Checkbox {...props} checked={checked} onChange={setChecked} />;
}

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: '启用通知',
    checked: false,
    onChange: () => {},
    disabled: false,
  },
  argTypes: {
    checked: {
      control: false,
      description: '当前是否勾选（受控），点击画布里的复选框即可切换',
    },
    onChange: {
      control: false,
      description: '用户请求的新状态，由调用方写回 checked',
    },
    label: {
      control: 'text',
      description: '可见文案，同时作为无障碍名称',
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
    title: {
      control: 'text',
      description: '悬停时的提示文案',
    },
    className: {
      control: false,
      description: '追加在外层 label 上的类名',
    },
    modalAutofocus: {
      control: false,
      description: '保留位，当前不影响渲染',
    },
  },
  render: (args) => <CheckboxDemo {...args} />,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 默认未勾选，点击切换。 */
export const Default: Story = {};

/** 初始就是勾选状态。 */
export const Checked: Story = {
  args: { checked: true, label: '已勾选的选项' },
};

/** 禁用后不可点击，也不参与键盘 Tab。 */
export const Disabled: Story = {
  args: { disabled: true, checked: true, label: '禁用的选项' },
};

/** 一组复选框并排时的常见排布。 */
export const Group: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <CheckboxDemo label="评论" checked onChange={() => {}} />
      <CheckboxDemo label="提及" checked onChange={() => {}} />
      <CheckboxDemo label="系统通知" checked={false} onChange={() => {}} />
    </div>
  ),
};
