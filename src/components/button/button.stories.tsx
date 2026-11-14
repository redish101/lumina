import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, type ButtonVariant } from './button';

/** 演示用的 16px 图标；真实项目里换成图标库组件即可。 */
const PlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M8 3.5v9M3.5 8h9" />
  </svg>
);

const VARIANTS: ButtonVariant[] = ['primary', 'ghost', 'outline', 'toolbar'];
const SIZES = ['md', 'sm'] as const;

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Button',
    variant: 'primary',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: VARIANTS,
      description: '视觉风格，对应一组 `--lumina-alias-button-*` 令牌',
      table: { defaultValue: { summary: 'ghost' } },
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: '`md` 为 36px 高、12px 圆角；`sm` 为 28px 高、8px 圆角',
      table: { defaultValue: { summary: 'md' } },
    },
    icon: {
      control: false,
      description: '可选的 16px 前置图标',
    },
    children: {
      control: 'text',
      description: '按钮文案',
    },
    className: {
      control: false,
      description: '透传的类名，追加在组件自带的类名之后',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 主操作按钮，使用品牌主色填充。 */
export const Primary: Story = {
  args: { variant: 'primary' },
};

/** 默认变体：无背景，适合工具栏、列表行内的次级操作。 */
export const Ghost: Story = {
  args: { variant: 'ghost' },
};

/** 描边按钮，用 0.5px 内阴影描边，避免小数宽度下边框缺角。 */
export const Outline: Story = {
  args: { variant: 'outline' },
};

/** 工具栏按钮，浅色填充，常与图标搭配。 */
export const Toolbar: Story = {
  args: { variant: 'toolbar' },
};

/** 两种尺寸并排对比：`md` 36px、`sm` 28px。 */
export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
    </div>
  ),
};

/** 传入 `icon` 即可得到前置图标，图标尺寸固定 16px，不会被拉伸。 */
export const WithIcon: Story = {
  args: { icon: <PlusIcon />, children: 'New item' },
};

/** 禁用状态：透明度降到 40%，鼠标指针变为 `not-allowed`，hover 样式不再生效。 */
export const Disabled: Story = {
  args: { disabled: true },
};

/** 四种风格 × 两种尺寸的全家福，用来快速检查对齐与配色。 */
export const AllVariants: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      {SIZES.map((size) => (
        <div key={size} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {VARIANTS.map((variant) => (
            <Button {...args} key={variant} variant={variant} size={size}>
              {variant}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};
