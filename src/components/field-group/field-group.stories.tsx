import { useId } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FieldGroup } from './field-group';
import { Field } from '../field/field';
import { Input } from '../input/input';

function DemoField({ label, description }: { label: string; description?: string }) {
  const id = useId();
  return (
    <Field label={label} description={description} htmlFor={id}>
      <Input id={id} placeholder="请输入" />
    </Field>
  );
}

const meta = {
  title: 'Components/FieldGroup',
  component: FieldGroup,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: '账号信息',
    description: '这些信息仅用于登录，不会公开展示',
    columns: 2,
  },
  argTypes: {
    title: {
      control: 'text',
      description: '组标题，渲染为 fieldset 的 legend',
    },
    description: {
      control: 'text',
      description: '标题下方的辅助说明',
    },
    columns: {
      control: 'inline-radio',
      options: [1, 2, 3],
      description: '字段网格的列数，窄屏下多列会回落为单列',
    },
    children: {
      control: false,
      description: '组内的字段',
    },
    className: {
      control: false,
      description: '追加在最外层 fieldset 上的类名',
    },
  },
  render: (args) => (
    <div style={{ width: args.columns === 1 ? 320 : args.columns === 2 ? 520 : 720 }}>
      <FieldGroup {...args}>
        <DemoField label="用户名" description="3~20 个字符" />
        <DemoField label="邮箱" description="用于接收通知" />
        <DemoField label="密码" />
        <DemoField label="确认密码" />
      </FieldGroup>
    </div>
  ),
} satisfies Meta<typeof FieldGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认两列网格，字段随容器宽度均分。 */
export const Default: Story = {};

/** 三列适合短标签、短输入框的紧凑表单。 */
export const ThreeColumns: Story = {
  args: { columns: 3, title: '偏好设置' },
};

/** 单列适合长文本字段或窄侧栏。 */
export const SingleColumn: Story = {
  args: { columns: 1, title: '收货地址', description: '请填写完整的收货信息' },
};

/** 省略标题时仍保留分组语义，只是不渲染 legend。 */
export const WithoutTitle: Story = {
  args: { title: undefined, description: '只有说明文案的分组', columns: 2 },
};

/** 组标题与说明都会进入 fieldset 的可访问名称和描述。 */
export const WithDescription: Story = {
  args: {
    title: '安全设置',
    description: '修改后需要重新登录',
    columns: 1,
  },
};
