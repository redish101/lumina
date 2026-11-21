import type { Meta, StoryObj } from '@storybook/react-vite';
import { PathLabel } from './path-label';

const meta = {
  title: 'Components/PathLabel',
  component: PathLabel,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '用一行展示文件路径：目录淡、文件名亮，同时把完整路径放进 `title`。' +
          '长路径在任意字符处换行，适合工具栏、附件列表等窄容器。',
      },
    },
  },
  args: {
    path: 'src/components/path-label/path-label.tsx',
  },
  argTypes: {
    path: { control: 'text', description: '要展示的路径' },
    className: { control: false, description: '追加的类名' },
  },
} satisfies Meta<typeof PathLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 相对路径，目录与文件名分色。 */
export const Relative: Story = {
  decorators: [
    (Story) => (
      <div style={{ color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** 绝对路径同样按最后一个分隔符拆分。 */
export const Absolute: Story = {
  args: { path: '/Users/redish101/项目/lumina/src/index.ts' },
  decorators: [
    (Story) => (
      <div style={{ color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** Windows 风格的反斜杠也会被识别。 */
export const WindowsPath: Story = {
  args: { path: 'C:\\Users\\redish101\\项目\\lumina\\package.json' },
  decorators: [
    (Story) => (
      <div style={{ color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** 窄容器里会在路径中间换行，不会撑破布局。 */
export const LongPath: Story = {
  args: {
    path: '/Users/redish101/项目/lumina/src/components/terminal-block/terminal-block.stories.tsx',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 220,
          padding: 8,
          color: 'var(--lumina-alias-label-primary)',
          border: '1px solid var(--lumina-alias-border-l2)',
          borderRadius: 'var(--lumina-radius-sm)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/** 目录路径保留末尾分隔符语义，最后一段仍是文件名颜色。 */
export const Directory: Story = {
  args: { path: 'src/components/disclosure-row/' },
  decorators: [
    (Story) => (
      <div style={{ color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};
