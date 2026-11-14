import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextShimmer } from './text-shimmer';

const meta = {
  title: 'Components/TextShimmer',
  component: TextShimmer,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: '正在思考…',
    active: false,
  },
  argTypes: {
    children: {
      control: 'text',
      description: '文本或展示型子节点；嵌套的 TextShimmer 会读取同一份活动状态',
    },
    active: {
      control: 'boolean',
      description: '是否播放高亮扫光；为 true 时还会渲染一份惰性、裁剪过的装饰副本',
      table: { defaultValue: { summary: 'false' } },
    },
    className: {
      control: false,
      description: '追加在最外层容器上的类名',
    },
    contentClassName: {
      control: false,
      description: '同时应用到基础内容与装饰副本上的布局类名',
    },
  },
} satisfies Meta<typeof TextShimmer>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认静止态：不渲染装饰副本，只是可选中、可访问的普通文字。 */
export const Default: Story = {};

/**
 * 活动态：高亮遮罩每 1.5 秒从左向右扫过一次，动画无限循环。
 * 打开 Storybook 的动效开关或直接观察即可看到持续动画。
 */
export const Active: Story = {
  args: { active: true, children: '正在生成回答…' },
};

/** 长文本边界：容器宽度受限时高亮层不会撑大布局。 */
export const LongText: Story = {
  args: {
    active: true,
    children: '这是一段相当长的活动文案，用来确认扫光层被裁剪在容器内，不会产生横向滚动条。',
  },
  render: (args) => (
    <div style={{ width: 240 }}>
      <TextShimmer {...args} />
    </div>
  ),
};

/**
 * 嵌套实例：外层控制动画，内层自动继承活动状态，
 * 两层文字共享同一条扫光，而不是各跑各的。
 */
export const Nested: Story = {
  args: { active: true, children: '处理中' },
  render: (args) => (
    <TextShimmer {...args}>
      <TextShimmer>读取文件</TextShimmer>
      <TextShimmer>·</TextShimmer>
      <TextShimmer>分析内容</TextShimmer>
    </TextShimmer>
  ),
};

/**
 * 非字符串子节点：图标应放在 `TextShimmer` 外面，
 * 活动态下文本会被复制到装饰层，而图标不会跟着重复。
 */
export const WithIconOutside: Story = {
  args: { active: true, children: '正在运行' },
  render: (args) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="6" />
      </svg>
      <TextShimmer {...args} />
    </span>
  ),
};
