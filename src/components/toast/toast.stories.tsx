import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Toast, type ToastProps } from './toast';

/**
 * 演示包装：Toast 渲染到 body portal，这里用一个按钮重新挂载它，
 * 并按 `holdMs + 1000ms` 的节奏在淡出后卸载。
 */
function ToastDemo({
  text,
  icon,
  tone,
  holdMs,
  actions,
}: Pick<ToastProps, 'text' | 'icon' | 'tone' | 'holdMs' | 'actions'>) {
  // 初始不显示：Toast 是 portal 到 body 的固定层，Docs 页里一进来就弹会盖住标题
  const [visible, setVisible] = useState(false);
  const [seq, setSeq] = useState(0);

  const show = (): void => {
    setVisible(true);
    setSeq((current) => current + 1);
  };

  // 动作点击后收起提示条，模拟「执行撤销并关闭」的真实用法。
  const dismissAfterAction = actions?.map((action) => ({
    ...action,
    onClick: () => {
      action.onClick();
      setVisible(false);
    },
  }));

  return (
    <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
      <Button variant="primary" onClick={show}>
        {visible ? '重新显示 Toast' : '显示 Toast'}
      </Button>
      <span style={{ fontSize: 12, color: 'var(--lumina-alias-label-tertiary)' }}>
        保持 {((holdMs ?? 3000) / 1000).toFixed(1)} 秒后淡出并回调 `onDone`
      </span>
      {visible && (
        <Toast
          key={seq}
          text={text}
          icon={icon}
          tone={tone}
          holdMs={holdMs}
          actions={dismissAfterAction}
          onDone={() => {
            setVisible(false);
          }}
        />
      )}
    </div>
  );
}

const meta = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '顶部居中的瞬时提示条：滑入、保持、淡出，然后回调使用方卸载。' +
          '通过 body portal 渲染，保持时长既驱动卸载定时器，也作为 `--dsh-toast-hold` 交给样式表控制淡出延迟。',
      },
    },
  },
  args: {
    text: '设置已保存',
    onDone: () => undefined,
  },
  argTypes: {
    text: {
      control: 'text',
      description: '已解析好的提示文案，由使用方负责本地化',
    },
    icon: {
      control: false,
      description: '可选的前置图标；`tone="success"` 时忽略，因为成功态自带对勾图标',
    },
    tone: {
      control: 'inline-radio',
      options: ['success'],
      description: '传 `success` 时用圆形绿色对勾作前置图标；省略则图标位保留警告色',
    },
    anchor: {
      control: false,
      description: '可选的水平居中参照元素，例如输入卡片；省略时相对视口居中',
    },
    holdMs: {
      control: { type: 'number', min: 0, step: 500 },
      description: '淡出前保持全不透明的时间，默认 3000ms；同一个值也交给 CSS 控制淡出延迟',
      table: { defaultValue: { summary: '3000' } },
    },
    actions: {
      control: false,
      description:
        '可选的行内动作列表，每项为 `{ label, prefix?, onClick }`，接在正文后读作一句话；只有动作文字接收点击',
    },
    onDone: {
      control: false,
      description: '淡出完成后调用一次，使用方在这里卸载 Toast',
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 点按钮弹出提示条，4 秒后淡出并回调 `onDone`。 */
export const Default: Story = {
  render: (args) => (
    <ToastDemo
      text={args.text}
      icon={args.icon}
      tone={args.tone}
      holdMs={args.holdMs}
      actions={args.actions}
    />
  ),
};

/** 正文后可以接行内动作：前缀与动作文字读作一句话，点击动作即收起提示条。 */
export const WithActions: Story = {
  args: {
    text: '已把 3 封邮件移到垃圾箱',
    actions: [{ prefix: '或', label: '撤销', onClick: () => undefined }],
  },
  render: (args) => (
    <ToastDemo
      text={args.text}
      icon={args.icon}
      tone={args.tone}
      holdMs={args.holdMs}
      actions={args.actions}
    />
  ),
};

/** 成功态：使用设计稿里的圆形绿色对勾，忽略传入的 `icon`。 */
export const Success: Story = {
  args: {
    tone: 'success',
    text: '已保存到云端',
  },
  render: (args) => (
    <ToastDemo
      text={args.text}
      icon={args.icon}
      tone={args.tone}
      holdMs={args.holdMs}
      actions={args.actions}
    />
  ),
};

/** 文案较长时可以调大 `holdMs`，给阅读留出足够时间。 */
export const LongHold: Story = {
  args: {
    text: '导出失败：目标目录没有写入权限，请换一个位置后重试',
    holdMs: 8000,
  },
  render: (args) => (
    <ToastDemo
      text={args.text}
      icon={args.icon}
      tone={args.tone}
      holdMs={args.holdMs}
      actions={args.actions}
    />
  ),
};
