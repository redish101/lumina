import type { Meta, StoryObj } from '@storybook/react-vite';
import { JsonTree } from './json-tree';

const sample = {
  id: 42,
  name: 'lumina',
  private: false,
  tags: ['react', 'css-modules', 'storybook'],
  owner: { name: 'redish101', url: 'https://github.com/redish101' },
  stats: { stars: 128, forks: 6 },
};

const files = [
  { path: 'src/index.ts', size: 1240, changed: true },
  { path: 'src/components/button/button.tsx', size: 3820, changed: false },
  { path: 'src/styles/tokens.css', size: 9620, changed: true },
];

const richData = {
  createdAt: new Date('2026-11-21T08:38:42.000Z'),
  total: 9007199254740993n,
  missing: undefined,
  handler: () => {},
};

const circular: Record<string, unknown> = { name: 'self' };
circular.self = circular;

const meta = {
  title: 'Components/JsonTree',
  component: JsonTree,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '把任意 JSON 数据渲染成可折叠的树，保留键、字符串、数字等语法着色。' +
          '根节点始终展开，`defaultExpandedDepth` 控制默认展开层级；' +
          '支持左右方向键、循环引用保护以及 Date、BigInt 等非 JSON 值。',
      },
    },
  },
  args: {
    data: sample,
    defaultExpandedDepth: 1,
    label: '仓库信息',
  },
  argTypes: {
    data: { control: 'object', description: '要展示的数据' },
    defaultExpandedDepth: {
      control: { type: 'number', min: 1 },
      description: '默认展开到第几层，1 只展开根节点',
    },
    label: { control: 'text', description: '树的读屏标签' },
    className: { control: false, description: '追加的类名' },
  },
} satisfies Meta<typeof JsonTree>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 只展开根节点，嵌套对象以预览形式收起。 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};

/** 展开到第三层，适合查看结构稳定的配置对象。 */
export const DeepExpanded: Story = {
  render: (args) => <JsonTree {...args} defaultExpandedDepth={3} />,
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};

/** 数组用数字索引作为键。 */
export const ArrayData: Story = {
  render: () => <JsonTree data={files} label="文件列表" />,
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};

/** 根节点是标量时也能正常展示。 */
export const Primitive: Story = {
  render: () => <JsonTree data="hello, lumina" label="字符串" />,
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};

/** Date、BigInt、undefined 与函数都有可读的降级表示。 */
export const SpecialValues: Story = {
  render: () => <JsonTree data={richData} label="特殊值" />,
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};

/** 循环引用会被识别并标记，不会无限递归。 */
export const Circular: Story = {
  render: () => <JsonTree data={circular} label="循环引用" />,
  decorators: [
    (Story) => (
      <div style={{ width: 460 }}>
        <Story />
      </div>
    ),
  ],
};
