import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from './input';

/** 演示用的 16px 搜索图标；真实项目里换成图标库组件即可。 */
const SearchIcon = () => (
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
    <circle cx="7" cy="7" r="4.25" />
    <path d="m10.5 10.5 3 3" />
  </svg>
);

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    placeholder: '请输入内容',
    'aria-label': '示例输入框',
  },
  argTypes: {
    'aria-label': {
      // 无障碍标签只用于让示例在 a11y 面板里通过，不必出现在 props 表格中
      table: { disable: true },
    },
    icon: {
      control: false,
      description: '可选的 16px 前置图标',
    },
    className: {
      control: false,
      description: '追加在外层容器上的类名',
    },
    placeholder: {
      control: 'text',
      description: '占位文案',
    },
    type: {
      control: 'inline-radio',
      options: ['text', 'password', 'email', 'search'],
      description: '原生 input 的 `type`',
      table: { defaultValue: { summary: 'text' } },
    },
    disabled: {
      control: 'boolean',
      description: '禁用状态',
    },
  },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 最基础的用法：受控与否都行，其余原生属性（`value`、`onChange`、`maxLength`…）原样透传。 */
export const Default: Story = {};

/** 传入 `icon` 得到 16px 前置图标，聚焦时边框会变成品牌色。 */
export const WithIcon: Story = {
  args: { icon: <SearchIcon />, placeholder: '搜索' },
};

/** 通过 `defaultValue` 预填内容。 */
export const WithValue: Story = {
  args: { defaultValue: 'lumina@example.com' },
};

/** 密码框：`type="password"` 由原生 input 处理。 */
export const Password: Story = {
  args: { type: 'password', placeholder: '••••••••' },
};

/** 禁用状态：由外层容器透传到原生 input，图标一并变灰。 */
export const Disabled: Story = {
  args: { disabled: true, icon: <SearchIcon />, defaultValue: '不可编辑' },
};
