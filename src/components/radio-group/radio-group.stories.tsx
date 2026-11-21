import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { RadioGroup, type RadioGroupOption } from './radio-group';

const options: RadioGroupOption[] = [
  { value: 'email', label: '邮件' },
  { value: 'sms', label: '短信' },
  { value: 'wechat', label: '微信' },
];

/** 受控演示：方向键或点击只上报新值，选中状态由外部写回。 */
function ControlledDemo() {
  const [value, setValue] = useState('email');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <RadioGroup
        options={options}
        label="通知方式"
        value={value}
        onChange={(next) => setValue(next)}
      />
      <span style={{ fontSize: 12, color: 'var(--lumina-alias-label-tertiary)' }}>
        当前选择：{value}
      </span>
    </div>
  );
}

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    options,
    label: '通知方式',
    orientation: 'vertical',
    defaultValue: 'email',
    error: false,
    onChange: () => {},
  },
  argTypes: {
    options: {
      control: false,
      description: '按展示顺序排列的选项，支持 disabled',
    },
    value: {
      control: 'text',
      description: '当前值（受控）',
    },
    defaultValue: {
      control: 'text',
      description: '初始值（非受控）',
    },
    onChange: {
      control: false,
      description: '选择变化时回调，第一个参数是选中的值',
    },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: '选项的排列方向',
    },
    label: {
      control: 'text',
      description: '组标题，渲染为 fieldset 的 legend',
    },
    error: {
      control: 'boolean',
      description: '错误态：标题变红并同步 aria-invalid',
    },
    name: {
      control: 'text',
      description: '原生 radio 的 name；缺省时用 useId 生成',
    },
    className: {
      control: false,
      description: '追加在最外层 fieldset 上的类名',
    },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认纵向排列，原生 radio 的方向键切换由浏览器提供。 */
export const Default: Story = {};

/** 横向排列适合选项少、文案短的场景。 */
export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
};

/** 省略 `label` 时不渲染 legend，仍保留 fieldset 的分组语义。 */
export const WithoutLabel: Story = {
  args: { label: undefined },
};

/** 错误态只改标题颜色并标记 `aria-invalid`，错误文案交给 FormError。 */
export const Error: Story = {
  args: { error: true },
};

/** 单个选项可独立禁用，其余选项仍可用键盘切换。 */
export const DisabledOption: Story = {
  args: {
    options: [
      { value: 'email', label: '邮件' },
      { value: 'sms', label: '短信（暂不可用）', disabled: true },
      { value: 'wechat', label: '微信' },
    ],
  },
};

/** 受控用法：`value` 与 `onChange` 配合，外部状态决定选中项。 */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
