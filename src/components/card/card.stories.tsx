import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Card, type CardPadding } from './card';

const PADDINGS: CardPadding[] = ['none', 'sm', 'md', 'lg'];

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    title: '月度报告',
    description: '2026 年 10 月',
    padding: 'md',
    interactive: false,
    children: '本月共完成 42 个任务，平均响应时间 1.8 小时。',
  },
  argTypes: {
    title: {
      control: 'text',
      description: '卡片标题；与 `description`、`actions` 一起构成头部',
    },
    description: {
      control: 'text',
      description: '标题下方的补充说明',
    },
    actions: {
      control: false,
      description: '头部右侧的操作区，例如按钮或菜单',
    },
    footer: {
      control: false,
      description: '底部信息条，常用于更新时间、计数等次要信息',
    },
    padding: {
      control: 'inline-radio',
      options: PADDINGS,
      description: '内边距档位：none / sm / md / lg 对应 0 / 12 / 16 / 24px',
      table: { defaultValue: { summary: 'md' } },
    },
    interactive: {
      control: 'boolean',
      description: '悬停抬升并显示可点击指针；不注入 tabIndex 或点击行为',
      table: { defaultValue: { summary: 'false' } },
    },
    className: {
      control: false,
      description: '追加在最外层容器上的类名',
    },
    children: {
      control: 'text',
      description: '卡片主体内容',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 只有标题与描述的标准卡片；主体承接任意内容。 */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <Card {...args} />
    </div>
  ),
};

/** 头部右侧可以放操作按钮，标题区会自动让出空间。 */
export const WithActions: Story = {
  args: {
    actions: (
      <Button size="sm" variant="outline">
        导出
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Card {...args} />
    </div>
  ),
};

/** 底部信息条与主体之间有一条细分隔线，适合放更新时间或计数。 */
export const WithFooter: Story = {
  args: {
    footer: '更新于今天 09:24',
    actions: (
      <Button size="sm" variant="ghost">
        查看
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Card {...args} />
    </div>
  ),
};

/** 四档内边距并排对比；`none` 适合让图片或表格自己贴边。 */
export const Padding: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 260px)', gap: 16 }}>
      {PADDINGS.map((padding) => (
        <Card key={padding} title={`padding = ${padding}`} padding={padding}>
          内容与边框之间的距离随档位变化。
        </Card>
      ))}
    </div>
  ),
};

/** 交互卡片：悬停时轻微抬升、加深背景并显示指针，是否可点击仍由使用方决定。 */
export const Interactive: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 12, width: 360 }}>
      <Card interactive title="设计评审" description="今天 14:00 · 会议室 A" footer="6 人已确认">
        过一遍新版导航与空状态的视觉稿。
      </Card>
      <Card interactive title="发布检查" description="明天 10:00" footer="待开始">
        确认构建、类型检查与变更日志都已就绪。
      </Card>
    </div>
  ),
};

/** 无头部、无底部的纯内容卡片，用于自定义排版。 */
export const BodyOnly: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Card padding="lg">只有主体内容，卡片仍保留圆角、描边与背景。</Card>
    </div>
  ),
};
