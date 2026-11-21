import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Textarea } from './textarea';

const longText =
  '这是一段用来演示自动撑高的文本。随着输入内容变长，输入框会按 scrollHeight 逐行增高，' +
  '直到达到 maxRows 指定的最大行数；超过上限后高度不再变化，改为出现纵向滚动条。\n\n' +
  '再补一段文字，让默认的展示更接近真实的多行备注。';

/** 受控演示：外部持有 value，组件只负责渲染与上报输入。 */
function ControlledDemo() {
  const [value, setValue] = useState('受控的文本内容');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 320 }}>
      <Textarea
        aria-label="示例文本域"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={3}
        autoResize
        maxRows={6}
        placeholder="输入一些内容"
      />
      <span style={{ fontSize: 12, color: 'var(--lumina-alias-label-tertiary)' }}>
        {value.length} 个字符
      </span>
    </div>
  );
}

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    placeholder: '请输入内容',
    rows: 3,
    resize: 'vertical',
    autoResize: false,
    error: false,
  },
  argTypes: {
    rows: {
      control: 'number',
      description: '初始可见行数，默认 3',
    },
    autoResize: {
      control: 'boolean',
      description: '是否按内容自动撑高；开启后高度由组件接管',
    },
    maxRows: {
      control: 'number',
      description: 'autoResize 时最多展开的行数，超出后出现滚动条',
    },
    resize: {
      control: 'inline-radio',
      options: ['none', 'vertical'],
      description: '是否允许用户手动调整高度',
    },
    error: {
      control: 'boolean',
      description: '错误态：红色边框并同步 aria-invalid',
    },
    label: {
      control: 'text',
      description: '字段标签；提供时内部用 Field 排版',
    },
    description: {
      control: 'text',
      description: '标签下方的辅助说明',
    },
    className: {
      control: false,
      description: '追加在最外层元素上的类名',
    },
    placeholder: {
      control: 'text',
      description: '占位文案',
    },
  },
  render: (args) => (
    <div style={{ width: 320 }}>
      <Textarea {...args} />
    </div>
  ),
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认三行、允许纵向拖拽调整高度。 */
export const Default: Story = {
  args: { 'aria-label': '示例文本域' },
};

/** 开启 `autoResize` 后按内容高度撑开，适合聊天输入框等场景。 */
export const AutoResize: Story = {
  args: {
    'aria-label': '示例文本域',
    autoResize: true,
    defaultValue: longText,
    maxRows: 8,
  },
};

/** 超过 `maxRows` 后高度封顶，内容改由纵向滚动条呈现。 */
export const WithMaxRows: Story = {
  args: {
    'aria-label': '示例文本域',
    autoResize: true,
    maxRows: 3,
    defaultValue: longText,
  },
};

/** 通过 `label` 与 `description` 一行拿到完整字段排版与无障碍关联。 */
export const WithLabel: Story = {
  args: {
    label: '备注',
    description: '补充说明会同步给读屏软件',
    placeholder: '还有什么需要补充的吗？',
  },
};

/** 错误态只改视觉与 `aria-invalid`，错误文案交给外层 Field 或 FormError。 */
export const Error: Story = {
  args: {
    label: '备注',
    error: true,
    placeholder: '必填项',
  },
};

/** 固定高度：关闭自动撑高后交给 `rows` 决定，内容超出时原生滚动。 */
export const FixedHeight: Story = {
  args: {
    'aria-label': '示例文本域',
    rows: 5,
    resize: 'none',
    defaultValue: longText,
  },
};

/** 受控用法：`value` 与 `onChange` 配合，外部可实时统计字数。 */
export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

/** 禁用后不可编辑、不可调整高度，整体降低透明度。 */
export const Disabled: Story = {
  args: {
    'aria-label': '示例文本域',
    disabled: true,
    defaultValue: '不可编辑的内容',
  },
};
