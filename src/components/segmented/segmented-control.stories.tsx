import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SegmentedControl, type SegmentedControlOption } from './segmented-control';

const DEFAULT_OPTIONS: readonly SegmentedControlOption<string>[] = [
  { value: 'day', label: '日' },
  { value: 'week', label: '周' },
  { value: 'month', label: '月' },
];

const TWO_OPTIONS: readonly SegmentedControlOption<string>[] = [
  { value: 'list', label: '列表' },
  { value: 'grid', label: '网格' },
];

const FIVE_OPTIONS: readonly SegmentedControlOption<string>[] = [
  { value: 'mon', label: '周一' },
  { value: 'tue', label: '周二' },
  { value: 'wed', label: '周三' },
  { value: 'thu', label: '周四' },
  { value: 'fri', label: '周五' },
];

const LOCKED_OPTIONS: readonly SegmentedControlOption<string>[] = [
  { value: 'personal', label: '个人' },
  { value: 'team', label: '团队', disabled: true, title: '当前套餐不支持团队空间' },
  { value: 'enterprise', label: '企业' },
];

/** 受控包装：点击或方向键只请求新值，选中状态由本地 state 持有。 */
function ControlledDemo({
  id,
  label,
  options,
  initialValue,
}: {
  id: string;
  label: string;
  options: readonly SegmentedControlOption<string>[];
  initialValue: string;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
      <SegmentedControl id={id} label={label} options={options} value={value} onChange={setValue} />
      <span style={{ fontSize: 13, color: 'var(--lumina-alias-label-secondary)' }}>
        当前选择：{value}
      </span>
    </div>
  );
}

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    id: 'range',
    value: 'week',
    options: DEFAULT_OPTIONS,
    onChange: () => undefined,
    label: '时间范围',
  },
  argTypes: {
    id: {
      control: 'text',
      description:
        '基础 id：每个分段的 id 为 `<id>-<value>`，并用它拼出 `aria-controls` 指向的面板 id',
    },
    value: {
      control: false,
      description: '当前选中的值；组件完全受控，需要配合 `onChange` 使用',
    },
    options: {
      control: false,
      description:
        '按展示顺序排列的分段数组，每项包含 `value`、`label` 以及可选的 `disabled`、`title`',
    },
    onChange: {
      control: false,
      description: '点击或键盘操作请求切换时触发；不会用已选中的值回调',
    },
    label: {
      control: 'text',
      description: 'tablist 的本地化可访问名称，供屏幕阅读器朗读',
    },
    disabled: {
      control: 'boolean',
      description: '禁用全部分段，通常用于面板上有写入或请求正在进行时',
      table: { defaultValue: { summary: 'false' } },
    },
    className: {
      control: false,
      description: '追加在外层容器上的类名，用于布局定位',
    },
  },
} satisfies Meta<typeof SegmentedControl>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认用法：受控组件，点击分段或按左右方向键、Home/End 都会切换并同步选中态。 */
export const Default: Story = {
  render: (args) => (
    <ControlledDemo
      id={args.id}
      label={args.label}
      options={args.options}
      initialValue={args.value}
    />
  ),
};

/** 选项数量不同也是同一套等宽网格：两个选项和五个选项分别等分宽度，滑块自动适配。 */
export const OptionCounts: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 20, justifyItems: 'center' }}>
      <ControlledDemo id="two" label="视图模式" options={TWO_OPTIONS} initialValue="list" />
      <ControlledDemo id="five" label="工作日" options={FIVE_OPTIONS} initialValue="wed" />
    </div>
  ),
};

/** 单个分段可以单独禁用：方向键会跳过它，悬停时通过 `title` 说明原因。 */
export const WithDisabledOption: Story = {
  render: () => (
    <ControlledDemo
      id="workspace"
      label="工作空间"
      options={LOCKED_OPTIONS}
      initialValue="personal"
    />
  ),
};

/** 整组禁用：用于当前面板正在写入或请求中、切换会中断它的场景。 */
export const Disabled: Story = {
  args: { disabled: true },
};
