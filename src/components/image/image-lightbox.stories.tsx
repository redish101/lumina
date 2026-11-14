import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ImageLightbox, type ImageLightboxProps } from './image-lightbox';

/** 内联 SVG 转成 data URI：不依赖外网图片，离线也能稳定渲染。 */
const SAMPLE_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="lightbox-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2b3f91"/>
        <stop offset="1" stop-color="#7c3aed"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#lightbox-bg)"/>
    <circle cx="920" cy="180" r="90" fill="#ffffff" fill-opacity="0.3"/>
    <path d="M0 640 L300 360 L560 590 L760 420 L1200 700 L1200 800 L0 800 Z" fill="#ffffff" fill-opacity="0.4"/>
    <path d="M0 720 L240 540 L480 690 L700 560 L1200 760 L1200 800 L0 800 Z" fill="#ffffff" fill-opacity="0.25"/>
    <text x="64" y="104" fill="#ffffff" font-family="system-ui, sans-serif" font-size="48" font-weight="600">lumina lightbox</text>
  </svg>`,
)}`;

const LABELS = { dialog: '图片预览', close: '关闭预览' };

/** 点击缩略图打开真实的大图预览；关闭后焦点会回到缩略图。 */
function InteractiveLightbox(props: ImageLightboxProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="打开图片预览"
        onClick={() => {
          setOpen(true);
        }}
        style={{
          padding: 0,
          border: 'none',
          background: 'transparent',
          borderRadius: 12,
          overflow: 'hidden',
          cursor: 'zoom-in',
          display: 'block',
        }}
      >
        <img src={props.src} alt="打开图片预览的缩略图" style={{ display: 'block', width: 240 }} />
      </button>
      {open && (
        <ImageLightbox
          {...props}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

/** 直接以受控 `open: true` 打开；关闭后留一个按钮方便再次打开。 */
function ControlledLightbox(props: ImageLightboxProps) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
      >
        重新打开预览
      </button>
    );
  }
  return (
    <ImageLightbox
      {...props}
      onClose={() => {
        setOpen(false);
      }}
    />
  );
}

const meta = {
  title: 'Components/ImageLightbox',
  component: ImageLightbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          '点击缩略图后打开的原图预览层。支持 Esc、点击遮罩、点击关闭按钮三种关闭方式，' +
          '卸载时把焦点还给打开者；通过 body portal 渲染，遮罩不会被祖先的 transform/filter 困住。',
      },
    },
  },
  args: {
    src: SAMPLE_SRC,
    alt: '示例图片：紫色山景插画的大图',
    labels: LABELS,
    onClose: fn(),
  },
  argTypes: {
    src: {
      control: 'text',
      description: '原图地址',
    },
    alt: {
      control: 'text',
      description: '图片替代文本，同时作为图片的无障碍名称',
    },
    labels: {
      control: false,
      description: '对话框与关闭按钮的本地化文案',
    },
    contextMenuProps: {
      control: false,
      description: '可选的原始图片手势绑定（右键菜单、键盘事件与 tabIndex）',
    },
    onClose: {
      control: false,
      description: '关闭回调，由打开方负责卸载本组件',
    },
  },
} satisfies Meta<typeof ImageLightbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 真实可交互：点击缩略图打开大图，可按 Esc、点遮罩或点关闭按钮退出。 */
export const ClickToOpen: Story = {
  render: (args) => <InteractiveLightbox {...args} />,
};

/** 受控打开：组件本身没有 `open` prop，由外层状态以 `open: true` 初始挂载；关闭即卸载。 */
export const OpenByDefault: Story = {
  parameters: {
    // 这个 story 一渲染就会用 portal 覆盖整个视口，放进文档页会挡住其它内容。
    docs: { disable: true },
  },
  render: (args) => <ControlledLightbox {...args} />,
};
