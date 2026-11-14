import type { Meta, StoryObj } from '@storybook/react-vite';
import { ShortcutKeys } from './shortcut-keys';

const meta = {
  title: 'Components/ShortcutKeys',
  component: ShortcutKeys,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    keys: ['⌘', 'K'],
    variant: 'plain',
  },
  argTypes: {
    keys: {
      control: 'object',
      description: '生效的按键标签数组；`+` 作为分隔符元素时会被单独渲染',
    },
    variant: {
      control: 'inline-radio',
      options: ['plain', 'tooltip'],
      description: '`plain` 无边框键帽；`tooltip` 为提示框内的键帽样式',
      table: { defaultValue: { summary: 'plain' } },
    },
    className: {
      control: false,
      description: '透传的类名，追加在容器上',
    },
  },
} satisfies Meta<typeof ShortcutKeys>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认形态：无边框键帽，键名由调用方按当前平台传入。 */
export const Default: Story = {};

/** macOS 组合键：`mod+K` 在 Mac 上呈现为 `⌘ K`。 */
export const ModK: Story = {
  args: { keys: ['⌘', 'K'] },
};

/** Windows/Linux 组合键：同一绑定在其它平台呈现为 `Ctrl K`。 */
export const CtrlK: Story = {
  args: { keys: ['ctrl', 'K'] },
};

/** 多键组合：shift + alt + enter，按顺序逐个渲染键帽。 */
export const ShiftAltEnter: Story = {
  args: { keys: ['shift', 'alt', 'enter'] },
};

/** 提示框变体：每个键帽都有 16px 的方角底色。 */
export const Tooltip: Story = {
  args: { variant: 'tooltip', keys: ['⌘', 'K'] },
};

/** 提示框里用 `+` 分隔时，整条组合会合并到一个键帽中。 */
export const JoinedCombination: Story = {
  args: { variant: 'tooltip', keys: ['mod', '+', 'K'] },
};

/** 更长的组合在提示框里仍然保持单行，不会换行。 */
export const LongCombination: Story = {
  args: { variant: 'tooltip', keys: ['ctrl', '+', 'shift', '+', 'enter'] },
};
