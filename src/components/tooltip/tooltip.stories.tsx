import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Tooltip, type TooltipSide } from './tooltip';

const SIDES: TooltipSide[] = ['right', 'left', 'bottom', 'top'];

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '给单个锚点元素挂上悬停/聚焦提示。气泡用 fixed 定位并测量自身尺寸后再显示，' +
          '放不下时自动翻到对面或垂直方向；需要跳出祖先的 `overflow` 裁剪或层叠上下文时打开 `portal`。',
      },
    },
  },
  args: {
    label: '创建新会话',
    children: <Button variant="outline">悬停我</Button>,
  },
  argTypes: {
    label: {
      control: 'text',
      description:
        '气泡文案。传空字符串则只显示 `shortcutKeys`；传函数时只在气泡可见时求值，可用于随状态变化的提示',
    },
    shortcutKeys: {
      control: false,
      description: "渲染在文案之后的快捷键键帽，例如 `['⌘', 'K']`",
    },
    side: {
      control: 'inline-radio',
      options: SIDES,
      description: '期望方位，默认右侧；放不下时依次尝试对面与垂直方向',
      table: { defaultValue: { summary: 'right' } },
    },
    align: {
      control: 'inline-radio',
      options: ['center', 'end'],
      description:
        '上/下气泡的水平对齐：`end` 贴锚点右边缘，适合旁边还有其他悬停面的锚点；左右气泡忽略此项',
      table: { defaultValue: { summary: 'center' } },
    },
    delayMs: {
      control: { type: 'number', min: 0, step: 50 },
      description: '悬停多少毫秒后显示，默认 0 立即显示',
      table: { defaultValue: { summary: '0' } },
    },
    focusDelayMs: {
      control: { type: 'number', min: 0, step: 50 },
      description: '键盘聚焦多少毫秒后显示，默认 0；失焦、点击、移出、禁用都会取消待显示的提示',
      table: { defaultValue: { summary: '0' } },
    },
    gap: {
      control: { type: 'number', min: 0, step: 1 },
      description: '上/下气泡与锚点的间距（像素），默认 8；左右气泡固定 10px',
      table: { defaultValue: { summary: '8' } },
    },
    disabled: {
      control: 'boolean',
      description: '是否抑制气泡。锚点照常渲染，切换不会重挂锚点、不会打断它的过渡动画',
      table: { defaultValue: { summary: 'false' } },
    },
    portal: {
      control: 'boolean',
      description: '是否把气泡 portal 到 `document.body`，用来摆脱祖先的裁剪与层叠上下文',
      table: { defaultValue: { summary: 'false' } },
    },
    maxWidth: {
      control: { type: 'number', min: 0, step: 10 },
      description: '气泡宽度上限（像素），仍受视口边距约束',
    },
    openOnClick: {
      control: 'boolean',
      description:
        '点击/轻触也把气泡钉住以便阅读；再次点击、Escape、Tab 或外部指针按下会关闭。默认关闭，适合普通操作提示',
      table: { defaultValue: { summary: 'false' } },
    },
    onlyWhenClipped: {
      control: 'boolean',
      description: '只在锚点（或其内部元素）横向溢出时才显示，用于被省略号截断的标签',
      table: { defaultValue: { summary: 'false' } },
    },
    children: {
      control: false,
      description: '单个锚点元素，例如 `<Button>`；它自己的 ref 会与 Tooltip 的 ref 合并',
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 最基础的用法：悬停按钮，在右侧显示一行文字。 */
export const Default: Story = {};

/** 带快捷键提示：文案后追加键帽，组合键用 `'+'` 分隔。 */
export const WithShortcut: Story = {
  args: {
    label: '打开命令面板',
    shortcutKeys: ['⌘', 'K'],
    children: <Button variant="outline">命令面板</Button>,
  },
};

/** 四个方向并排：`right`、`left`、`bottom`、`top`。空间不足时会自动翻转。 */
export const Sides: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: '96px 140px', gridTemplateColumns: 'repeat(2, auto)' }}>
      {SIDES.map((side) => (
        <Tooltip {...args} key={side} side={side} label={side}>
          <Button variant="outline">{side}</Button>
        </Tooltip>
      ))}
    </div>
  ),
};

/** 多行内容：文案里的换行会被保留（`white-space: pre-line`），可用第二行当副标题。 */
export const RichContent: Story = {
  args: {
    label: '新建会话\n⌘N · 从当前工作目录开始',
    children: <Button variant="outline">新建</Button>,
  },
};

/** `disabled` 为 true 时不显示气泡，锚点本身的行为与外观不变。 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: <Button variant="outline">禁用提示</Button>,
  },
};

/** 延迟显示：`delayMs` 控制悬停，`focusDelayMs` 控制键盘聚焦，适合放过道的列表。 */
export const Delay: Story = {
  args: {
    label: '500 毫秒后出现',
    delayMs: 500,
    focusDelayMs: 500,
    children: <Button variant="outline">悬停或 Tab 聚焦</Button>,
  },
};

/** 祖先带 `overflow: hidden` 时气泡会被裁掉；打开 `portal` 后气泡挂到 body 上即可完整显示。 */
export const Portal: Story = {
  render: (args) => (
    <div
      style={{
        overflow: 'hidden',
        padding: 32,
        border: '1px dashed var(--lumina-alias-border-l3)',
        borderRadius: 12,
      }}
    >
      <Tooltip {...args} portal label="我逃出了 overflow: hidden">
        <Button variant="outline">Portal</Button>
      </Tooltip>
    </div>
  ),
};

/** 点击钉住气泡方便阅读：再次点击、按 Escape/Tab 或在外部按下指针都会关闭。 */
export const OpenOnClick: Story = {
  args: {
    label: '点击后保持显示，按 Esc 关闭',
    shortcutKeys: ['Esc'],
    openOnClick: true,
    children: <Button variant="outline">点击我</Button>,
  },
};

/** 只在文案被省略号截断时显示：锚点通过 `scrollWidth > clientWidth` 判定为溢出。 */
export const OnlyWhenClipped: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Tooltip {...args} onlyWhenClipped label="这段被截断的文案的完整内容">
        <Button
          variant="outline"
          style={{
            display: 'block',
            width: 160,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          这段文案太长会被省略号截断
        </Button>
      </Tooltip>
      <Tooltip {...args} onlyWhenClipped label="短文案不会弹出气泡">
        <Button variant="outline" style={{ display: 'block', width: 160 }}>
          短文案
        </Button>
      </Tooltip>
    </div>
  ),
};
