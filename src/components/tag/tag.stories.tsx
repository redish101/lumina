import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag, type TagTone } from './tag';

const TONES: TagTone[] = [
  'outline',
  'solid',
  'neutral',
  'quiet',
  'success',
  'info',
  'warning',
  'danger',
];

const meta = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Tag',
    tone: 'outline',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: TONES,
      description: '调色板：描边、反色、中性、低调以及四种状态色',
      table: { defaultValue: { summary: 'outline' } },
    },
    children: {
      control: 'text',
      description: '标签文案，由渲染方提供本地化文本',
    },
    className: {
      control: false,
      description: '透传的类名，用来做外部布局定位',
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认形态：三级文字颜色上的 0.5px 描边，适合只读事实。 */
export const Default: Story = {};

/** 反色填充：一组标签里只用一个，标示当前选中项。 */
export const Solid: Story = {
  args: { tone: 'solid', children: 'Selected' },
};

/** 中性灰填充：没有状态含义的中性事实。 */
export const Neutral: Story = {
  args: { tone: 'neutral', children: 'Neutral' },
};

/** 纯文字、无填充：比中性态更低调。 */
export const Quiet: Story = {
  args: { tone: 'quiet', children: 'Quiet' },
};

/** 绿色：健康或已启用。 */
export const Success: Story = {
  args: { tone: 'success', children: 'Healthy' },
};

/** 蓝色：信息性分类，不代表健康度。 */
export const Info: Story = {
  args: { tone: 'info', children: 'Info' },
};

/** 琥珀色：需要关注，但还不是失败。 */
export const Warning: Story = {
  args: { tone: 'warning', children: 'Attention' },
};

/** 红色：失败状态。 */
export const Danger: Story = {
  args: { tone: 'danger', children: 'Failed' },
};

/** 长文案边界：标签不换行，宽度随内容增长，不会挤压内部文字。 */
export const LongText: Story = {
  args: { tone: 'neutral', children: 'A very long tag label that stays on one line' },
};

/** 全部调色板并排对比，用来快速检查配色与对齐。 */
export const AllTones: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, maxWidth: 360 }}>
      {TONES.map((tone) => (
        <Tag {...args} key={tone} tone={tone}>
          {tone}
        </Tag>
      ))}
    </div>
  ),
};
