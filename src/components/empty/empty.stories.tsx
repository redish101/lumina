import type { Meta, StoryObj } from '@storybook/react-vite';
import { IconCheckCircleOutline, IconPlusOutline } from '../../icons';
import { Button } from '../button';
import { Empty, type EmptySize } from './empty';

const SIZES: EmptySize[] = ['sm', 'md'];

const meta = {
  title: 'Components/Empty',
  component: Empty,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    icon: <IconCheckCircleOutline />,
    title: '还没有任务',
    description: '创建第一个任务，开始跟踪你的进度。',
    size: 'md',
  },
  argTypes: {
    icon: {
      control: false,
      description: '顶部图标；容器固定 40px（sm 为 32px），图标会自动铺满',
    },
    title: {
      control: 'text',
      description: '主标题，说明当前没有什么',
    },
    description: {
      control: 'text',
      description: '补充说明，引导下一步操作',
    },
    action: {
      control: false,
      description: '行动区，通常放一个主按钮',
    },
    size: {
      control: 'inline-radio',
      options: SIZES,
      description: '尺寸档位：md 使用 40px 图标与 32px 纵向留白，sm 更紧凑',
      table: { defaultValue: { summary: 'md' } },
    },
    className: {
      control: false,
      description: '追加在最外层容器上的类名',
    },
  },
} satisfies Meta<typeof Empty>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认的空状态：图标、标题与说明居中排列。 */
export const Default: Story = {
  render: (args) => (
    <div style={{ width: 360 }}>
      <Empty {...args} />
    </div>
  ),
};

/** 带行动按钮的空状态，引导用户直接创建第一条内容。 */
export const WithAction: Story = {
  args: {
    title: '还没有项目',
    description: '项目会把相关的任务、文档和讨论放在一起。',
    action: <Button variant="primary">新建项目</Button>,
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Empty {...args} />
    </div>
  ),
};

/** 紧凑尺寸适合嵌在卡片、表格或侧栏里。 */
export const Small: Story = {
  args: {
    size: 'sm',
    icon: <IconPlusOutline />,
    title: '暂无成员',
    description: '邀请同事加入这个工作区。',
    action: (
      <Button size="sm" variant="outline">
        邀请成员
      </Button>
    ),
  },
  render: (args) => (
    <div style={{ width: 300 }}>
      <Empty {...args} />
    </div>
  ),
};

/** 不传图标时只保留文字与行动区，排版同样居中。 */
export const WithoutIcon: Story = {
  args: {
    icon: undefined,
    title: '没有匹配的结果',
    description: '换一个关键词，或者清除筛选条件再试一次。',
  },
  render: (args) => (
    <div style={{ width: 360 }}>
      <Empty {...args} />
    </div>
  ),
};

/** 两种尺寸并排对比，图标容器与字号一起收紧。 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{
            width: 280,
            borderRadius: 'var(--lumina-radius-lg)',
            border: '1px dashed var(--lumina-alias-border-l3)',
          }}
        >
          <Empty
            size={size}
            icon={<IconCheckCircleOutline />}
            title={`size = ${size}`}
            description="空状态会占用父容器允许的空间并居中。"
          />
        </div>
      ))}
    </div>
  ),
};
