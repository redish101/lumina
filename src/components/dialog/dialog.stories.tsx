import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../button';
import { Dialog, type DialogProps } from './dialog';

interface DialogDemoProps extends Omit<DialogProps, 'open' | 'onClose' | 'actions'> {
  /** 打开对话框的按钮文案。 */
  triggerLabel?: string;
  /** 是否渲染默认的操作按钮，便于演示纯正文场景。 */
  showActions?: boolean;
  /** 确认按钮文案。 */
  confirmLabel?: string;
}

/** 演示包装：管理 open 状态，并把取消/确认按钮接到关闭逻辑上。 */
function DialogDemo({
  triggerLabel = '打开对话框',
  showActions = true,
  confirmLabel = '确认',
  ...props
}: DialogDemoProps) {
  const [open, setOpen] = useState(false);
  const close = (): void => {
    setOpen(false);
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog
        {...props}
        open={open}
        onClose={close}
        actions={
          showActions ? (
            <>
              <Button onClick={close}>取消</Button>
              <Button variant="primary" onClick={close}>
                {confirmLabel}
              </Button>
            </>
          ) : undefined
        }
      />
    </>
  );
}

/** 演示「只能通过按钮关闭」的配置：遮罩与 Esc 都不生效。 */
function LockedDialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>打开不可误关对话框</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="发布任务"
        description="发布后所有成员都会收到通知。"
        closeOnBackdrop={false}
        closeOnEsc={false}
        actions={
          <Button variant="primary" onClick={() => setOpen(false)}>
            我知道了
          </Button>
        }
      >
        点击遮罩或按 Esc 都不会关闭，只能使用下方按钮。
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '极简受控对话框：负责 body portal、遮罩、焦点陷阱、Esc 关闭与滚动锁，' +
          '标题、说明、正文与操作区全部由调用方组合。关闭后焦点会还给打开它的元素。',
      },
    },
  },
  args: {
    open: false,
    onClose: () => undefined,
    title: '删除任务',
    description: '删除后无法恢复，请确认。',
    children: '任务「整理设计稿」将从所有列表中移除。',
    size: 'md',
    closeOnBackdrop: true,
    closeOnEsc: true,
  },
  argTypes: {
    open: {
      control: false,
      description: '是否显示对话框，组件完全受控',
    },
    onClose: {
      control: false,
      description: '请求关闭时调用，由调用方把 open 置为 false',
    },
    title: {
      control: false,
      description: '标题，同时作为对话框的无障碍名称',
    },
    description: {
      control: false,
      description: '补充说明，通过 aria-describedby 关联',
    },
    actions: {
      control: false,
      description: '操作区内容，通常放取消/确认按钮',
    },
    children: {
      control: 'text',
      description: '对话框正文',
    },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: '宽度档位，默认 md',
    },
    closeOnBackdrop: {
      control: 'boolean',
      description: '点击遮罩是否关闭，默认 true',
    },
    closeOnEsc: {
      control: 'boolean',
      description: '按 Esc 是否关闭，默认 true',
    },
    className: {
      control: false,
      description: '追加到最外层遮罩节点的类名',
    },
  },
  render: (args) => <DialogDemo {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 标准删除确认：标题、说明、正文与操作区齐全。 */
export const Default: Story = {
  render: (args) => <DialogDemo {...args} triggerLabel="删除任务" confirmLabel="删除" />,
  parameters: {
    docs: {
      description: {
        story: '最常见的删除确认，包含标题、说明、正文和两个操作按钮。',
      },
    },
  },
};

/** 小尺寸的短确认，只保留一句正文。 */
export const SmallConfirm: Story = {
  render: (args) => <DialogDemo {...args} triggerLabel="删除评论" confirmLabel="删除" />,
  args: {
    size: 'sm',
    title: '删除评论？',
    description: undefined,
    children: '删除后无法恢复。',
  },
  parameters: {
    docs: {
      description: {
        story: '`size="sm"` 适合只有一句话的轻量确认。',
      },
    },
  },
};

/** 大尺寸内容：正文较长时，正文区域会在面板内滚动。 */
export const LargeContent: Story = {
  render: (args) => <DialogDemo {...args} triggerLabel="导入任务" confirmLabel="开始导入" />,
  args: {
    size: 'lg',
    title: '导入任务',
    description: '从 CSV 文件导入 128 条任务，导入后可以随时撤销。',
    children: (
      <div>
        <p style={{ margin: '0 0 12px' }}>
          导入会按「标题、负责人、截止日期」三列解析文件，缺少标题的行将被跳过。
        </p>
        <p style={{ margin: '0 0 12px' }}>
          已存在的任务不会重复创建；负责人需要先加入当前项目，否则该行会标记为待分配。
        </p>
        <p style={{ margin: 0 }}>导入完成后会生成一份结果摘要，列出成功与跳过的行数。</p>
      </div>
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '`size="lg"` 提供更宽的阅读区域，适合表单或多段说明。',
      },
    },
  },
};

/** 只有正文，不渲染标题、说明与操作区，关闭方式完全交给遮罩和 Esc。 */
export const ContentOnly: Story = {
  render: (args) => <DialogDemo {...args} showActions={false} />,
  args: {
    title: undefined,
    description: undefined,
    children: '这是一个只有正文的最简对话框，点击遮罩或按 Esc 关闭。',
  },
  parameters: {
    docs: {
      description: {
        story: '省略 title、description 与 actions 后，只保留一层带内边距的正文。',
      },
    },
  },
};

/** 禁用遮罩与 Esc 关闭，必须点击操作按钮才能退出。 */
export const Locked: Story = {
  render: () => <LockedDialogDemo />,
  parameters: {
    docs: {
      description: {
        story: '`closeOnBackdrop={false}` 与 `closeOnEsc={false}` 适合发布、支付等不可误关的操作。',
      },
    },
  },
};
