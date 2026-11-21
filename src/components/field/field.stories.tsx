import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Field, type FieldProps } from './field';
import { Input } from '../input/input';

/** 用 `useId()` 生成唯一 id，避免文档页同时渲染多个示例时标签互相抢占。 */
function FieldDemo({ label, ...props }: FieldProps) {
  const id = useId();
  return (
    <div style={{ width: 320 }}>
      <Field {...props} label={label} htmlFor={id}>
        <Input
          id={id}
          aria-label={label == null ? '示例输入框' : undefined}
          placeholder="you@example.com"
        />
      </Field>
    </div>
  );
}

const meta = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    label: '邮箱',
    description: '用于登录与找回密码',
    required: false,
    orientation: 'vertical',
  },
  argTypes: {
    label: {
      control: 'text',
      description: '字段标签，支持任意 React 节点',
    },
    description: {
      control: 'text',
      description: '标签下方的辅助说明，会通过 aria-describedby 关联到控件',
    },
    error: {
      control: 'text',
      description: '错误文案；存在时字段进入错误态并同步 aria-invalid',
    },
    required: {
      control: 'boolean',
      description: '是否在标签后显示必填星号',
    },
    htmlFor: {
      control: false,
      description: '与子控件 id 配对的 htmlFor；示例中由 useId 自动生成',
    },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: '标签与控件的排布方向',
    },
    children: {
      control: false,
      description: '字段控件，通常是一个 Input、Textarea 或 Select',
    },
    className: {
      control: false,
      description: '追加在最外层容器上的类名',
    },
  },
  render: (args) => <FieldDemo {...args} />,
} satisfies Meta<typeof Field>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 最基础的纵向字段：标签、控件与辅助说明自上而下排列。 */
export const Default: Story = {};

/** 传入 `error` 后错误文案变红，字段进入错误态。 */
export const Error: Story = {
  args: { error: '请输入有效的邮箱地址' },
};

/** `required` 会在标签后追加一个同色的星号，星号本身对读屏隐藏。 */
export const Required: Story = {
  args: { required: true },
};

/** 横向排布把标签放到左侧列，适合设置面板等紧凑布局。 */
export const Horizontal: Story = {
  args: { orientation: 'horizontal', description: '标签在左，控件在右' },
};

/** 没有标签时只渲染控件与说明，适合配合控件的 `aria-label` 使用。 */
export const WithoutLabel: Story = {
  args: { label: undefined, description: '没有标签时仅保留说明文案' },
};

/** 必填与错误可以叠加：星号仍留在标签上，错误文案独占一行。 */
export const RequiredWithError: Story = {
  args: { required: true, error: '该字段不能为空' },
};
