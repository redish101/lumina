import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AnimatedRows } from './animated-rows';
import styles from './animated-rows.stories.module.css';

const initialKeys = ['alpha', 'bravo', 'charlie', 'delta', 'echo'];

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [next[index], next[swap]] = [next[swap] as T, next[index] as T];
  }
  return next;
}

interface DemoProps {
  initial?: readonly string[];
}

/** 一个可增删、可重排的列表，用来观察行的位移与淡入淡出。 */
function Demo({ initial = initialKeys }: DemoProps) {
  const [keys, setKeys] = useState<readonly string[]>([...initial]);
  const [selected, setSelected] = useState<string | null>(null);
  const [added, setAdded] = useState(0);

  return (
    <div>
      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => {
            setAdded((count) => count + 1);
            const key = `新行 ${added + 1}`;
            setKeys((current) => [...current.slice(0, 2), key, ...current.slice(2)]);
          }}
        >
          顶部插入
        </button>
        <button type="button" onClick={() => setKeys((current) => shuffle(current))}>
          打乱顺序
        </button>
        <button
          type="button"
          onClick={() => setKeys((current) => current.filter((_key, index) => index !== 1))}
        >
          删除第二行
        </button>
      </div>
      {/* AnimatedRows 会把退出的行克隆到绝对定位的叠加层里，所以外层要相对定位 */}
      <div style={{ position: 'relative' }}>
        <AnimatedRows className={styles.list} rowKeys={keys} ready resetKey="demo">
          {keys.map((key) => (
            <button
              key={key}
              type="button"
              data-row-key={key}
              className={selected === key ? `${styles.row} ${styles.selected}` : styles.row}
              onClick={() => setSelected(key)}
            >
              <span>{key}</span>
              <span aria-hidden="true">↕</span>
            </button>
          ))}
        </AnimatedRows>
      </div>
      <p className={styles.hint}>
        先点一下列表里的任意一行（或 Tab 进列表后按方向键），动画才会启用；红色/蓝色描边是选中态。
      </p>
    </div>
  );
}

const meta = {
  title: 'Components/AnimatedRows',
  component: AnimatedRows,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '按 key 追踪行位置的容器。列表增删或重排时，行会做位移和淡入淡出；' +
          '退出的行会被克隆到叠加层里做淡出。首次指针或键盘操作之后才启用动画，' +
          '且尊重系统的「减少动态效果」设置。',
      },
    },
  },
  args: {
    children: null,
    className: styles.list,
    rowKeys: initialKeys,
    ready: true,
    resetKey: 'demo',
  },
  argTypes: {
    children: { control: false, description: '子节点，每个行元素要带 data-row-key 属性' },
    className: { control: false, description: '追加在列表容器上的类名' },
    role: { control: 'text', description: '列表的语义角色' },
    label: { control: 'text', description: '列表的无障碍标签' },
    rowKeys: {
      control: false,
      description: '当前渲染顺序的行 key，必须与子节点上的 data-row-key 一一对应',
    },
    ready: { control: 'boolean', description: '数据是否已就绪；未就绪时不做动画' },
    resetKey: { control: 'text', description: '整体视图切换的标识，变化时直接定格不做动画' },
  },
} satisfies Meta<typeof AnimatedRows>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 增加、打乱、删除行时的位移与淡入淡出。 */
export const Default: Story = {
  render: () => <Demo />,
};

/** 长列表：只有与视口相交的行会动。 */
export const Many: Story = {
  render: () => (
    <Demo initial={Array.from({ length: 12 }, (_value, index) => `第 ${index + 1} 项`)} />
  ),
};
