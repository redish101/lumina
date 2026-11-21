import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, type SelectOption } from './select';

const options: SelectOption[] = [
  { value: 'beijing', label: '北京' },
  { value: 'shanghai', label: '上海' },
  { value: 'guangzhou', label: '广州' },
  { value: 'shenzhen', label: '深圳' },
];

/** 受控演示：选中的值由外部 state 持有，说明文案实时回显。 */
function ControlledDemo() {
  const [value, setValue] = useState('shanghai');
  return (
    <div style={{ width: 280 }}>
      <Select
        options={options}
        label="城市"
        description={`当前值：${value}`}
        value={value}
        onChange={(next) => setValue(next)}
      />
    </div>
  );
}

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    options,
    placeholder: '请选择城市',
    onChange: () => {},
  },
  argTypes: {
    options: {
      control: false,
      description: '按展示顺序排列的选项，支持 disabled',
    },
    placeholder: {
      control: 'text',
      description: '未选择时显示的占位项，会渲染为禁用的空值 option',
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
    label: {
      control: 'text',
      description: '字段标签；提供时内部用 Field 排版',
    },
    description: {
      control: 'text',
      description: '标签下方的辅助说明',
    },
    error: {
      control: 'boolean',
      description: '错误态：红色边框并同步 aria-invalid',
    },
    className: {
      control: false,
      description: '追加在最外层元素上的类名',
    },
    disabled: {
      control: 'boolean',
      description: '禁用整个选择器',
    },
  },
  render: (args) => (
    <div style={{ width: 280 }}>
      <Select {...args} />
    </div>
  ),
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 带占位项的非受控用法，选择后由原生 select 自己维护显示值。 */
export const Default: Story = {
  args: { 'aria-label': '城市' },
};

/** 不传 placeholder 时浏览器默认选中第一个选项。 */
export const WithoutPlaceholder: Story = {
  args: { placeholder: undefined, defaultValue: 'beijing', 'aria-label': '城市' },
};

/** 传入 `label` 与 `description` 即可得到完整字段排版和 aria 关联。 */
export const WithLabel: Story = {
  args: {
    label: '城市',
    description: '用于估算配送时间',
  },
};

/** 错误态只改视觉与 `aria-invalid`，错误文案交给外层 Field 或 FormError。 */
export const Error: Story = {
  args: {
    label: '城市',
    error: true,
  },
};

/** 整个选择器禁用：不可展开、不可提交，整体降低透明度。 */
export const Disabled: Story = {
  args: {
    label: '城市',
    disabled: true,
    defaultValue: 'shanghai',
  },
};

/** 单个选项可以独立禁用，用于「暂不可选」的城市。 */
export const DisabledOption: Story = {
  args: {
    'aria-label': '城市',
    options: [
      { value: 'beijing', label: '北京' },
      { value: 'shanghai', label: '上海' },
      { value: 'guangzhou', label: '广州（暂未开通）', disabled: true },
      { value: 'shenzhen', label: '深圳' },
    ],
  },
};

/** 受控用法：`value` 与 `onChange` 配合，外部状态决定当前选项。 */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
};
