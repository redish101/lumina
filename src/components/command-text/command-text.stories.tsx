import type { Meta, StoryObj } from '@storybook/react-vite';
import { CommandText } from './command-text';

const meta = {
  title: 'Components/CommandText',
  component: CommandText,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '内联展示一条命令，保留空格与换行。内容超过容器宽度时改为横向滚动，' +
          '并让溢出区域可聚焦，键盘用户也能读完整条命令。',
      },
    },
  },
  args: {
    text: 'pnpm typecheck',
    label: '类型检查命令',
  },
  argTypes: {
    text: { control: 'text', description: '命令文本，换行符会保留' },
    label: { control: 'text', description: '溢出时的读屏名称' },
    className: { control: false, description: '追加的类名' },
  },
} satisfies Meta<typeof CommandText>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 短命令，无需滚动。 */
export const Short: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 360, color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** 多行命令会原样保留换行。 */
export const MultiLine: Story = {
  args: {
    text: 'pnpm exec prettier --write src/components/command-text\npnpm typecheck\npnpm lint',
    label: '格式化与检查命令',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 420, color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** 超宽命令出现横向滚动，聚焦整段文本后可用方向键滚动。 */
export const Overflow: Story = {
  args: {
    text: 'pnpm exec tsc -p tsconfig.json --noEmit --pretty false --incremental --tsBuildInfoFile .cache/tsbuildinfo',
    label: '完整的类型检查命令',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 280,
          padding: 8,
          color: 'var(--lumina-alias-label-primary)',
          background: 'var(--lumina-alias-markdown-code-block)',
          borderRadius: 'var(--lumina-radius-sm)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

/** 没有空格的长 token 也不会撑破容器。 */
export const LongToken: Story = {
  args: {
    text: 'curl -sSL https://example.com/releases/download/v1.2.3/lumina-cli-darwin-arm64.tar.gz',
    label: '下载命令',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 240, color: 'var(--lumina-alias-label-primary)' }}>
        <Story />
      </div>
    ),
  ],
};

/** 放进深色代码块，颜色与字号跟随容器。 */
export const InsideCodeBlock: Story = {
  args: {
    text: '$ git rebase --interactive --autosquash origin/main',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 340,
          padding: '10px 14px',
          font: '12px/20px var(--lumina-font-family-code)',
          color: 'var(--lumina-alias-label-secondary)',
          background: 'var(--lumina-alias-markdown-code-block)',
          borderRadius: 'var(--lumina-radius-md)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};
