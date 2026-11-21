import type { Meta, StoryObj } from '@storybook/react-vite';
import { TerminalBlock } from './terminal-block';

const longOutput = Array.from(
  { length: 24 },
  (_, index) =>
    `[${String(index + 1).padStart(2, '0')}] compiled module src/components/part-${index + 1}.tsx`,
).join('\n');

const ansiOutput = [
  '\u001b[1;32m✓\u001b[0m build completed in 1.24s',
  '\u001b[31merror\u001b[0m type mismatch in src/components/button/button.tsx:12',
  '\u001b[33mwarning\u001b[0m unused import',
  '\u001b[38;5;208m256-color\u001b[0m \u001b[38;2;120;180;255mtruecolor\u001b[0m \u001b[4munderline\u001b[0m',
].join('\n');

const meta = {
  title: 'Components/TerminalBlock',
  component: TerminalBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '终端卡片：按多行命令逐行渲染提示符，输出支持常用 ANSI SGR 颜色与属性；' +
          '右侧展示运行状态、退出状态或信号，并按 `maxLines` 折叠长输出。',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 680 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    command: 'pnpm typecheck',
    cwd: '/Users/redish101/项目/lumina',
    output: '> tsc -p tsconfig.json --noEmit\n\n✓ 0 errors\n',
    exitCode: 0,
  },
  argTypes: {
    command: { control: 'text', description: '执行的命令，可包含多行' },
    cwd: { control: 'text', description: '工作目录，仅显示最后一段' },
    home: { control: 'text', description: '主目录，用于把 cwd 折叠为 ~' },
    output: { control: 'text', description: '命令输出，可包含 ANSI 转义序列' },
    exitCode: { control: 'number', description: '结束时的退出码' },
    signal: { control: 'text', description: '结束信号，优先于退出码' },
    running: { control: 'boolean', description: '是否仍在运行' },
    background: { control: 'boolean', description: '是否为后台任务' },
    maxLines: { control: 'number', description: '折叠前最多显示的输出行数' },
    copyText: { control: 'text', description: '复制内容的覆盖值' },
    runStateDot: { control: 'boolean', description: '是否显示运行状态圆点' },
    labels: { control: 'object', description: '覆盖默认中文文案' },
    className: { control: false, description: '追加的类名' },
  },
} satisfies Meta<typeof TerminalBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 成功结束的命令：绿色状态点、完整输出与复制按钮。 */
export const Default: Story = {};

/** 命令仍在运行：输出实时展示，状态点为进行中。 */
export const Running: Story = {
  args: {
    command: 'pnpm dev',
    cwd: '/Users/redish101/项目/lumina',
    output:
      '  VITE v7.0.0  ready in 412 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  press h + enter to show help\n',
    running: true,
  },
};

/** 非零退出码会显示红色状态点与退出码胶囊。 */
export const Failed: Story = {
  args: {
    command: 'pnpm lint',
    output: '✖ 2 problems (2 errors, 0 warnings)\n',
    exitCode: 1,
  },
};

/** 被信号终止时，信号文案优先于退出码。 */
export const Signal: Story = {
  args: {
    command: 'pnpm test --watch',
    signal: 'SIGINT',
    output: 'Test run interrupted.\n',
    exitCode: null,
  },
};

/** 常用 ANSI SGR 颜色、加粗、下划线与 256 色都能正确渲染。 */
export const AnsiColors: Story = {
  args: {
    command: 'pnpm build',
    output: ansiOutput,
    exitCode: 0,
  },
};

/** 超过 `maxLines` 时折叠中段，可展开、收起。 */
export const LongOutput: Story = {
  args: {
    command: 'pnpm build',
    output: longOutput,
    maxLines: 6,
    exitCode: 0,
  },
};
