import type { Meta, StoryObj } from '@storybook/react-vite';
import { ImagePreview } from './image-preview';

/** 内联 SVG 转成 data URI：不依赖外网图片，离线也能稳定渲染。 */
const SAMPLE_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270" viewBox="0 0 480 270">
    <defs>
      <linearGradient id="preview-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3757c9"/>
        <stop offset="1" stop-color="#8b5cf6"/>
      </linearGradient>
    </defs>
    <rect width="480" height="270" fill="url(#preview-bg)"/>
    <circle cx="372" cy="72" r="34" fill="#ffffff" fill-opacity="0.35"/>
    <path d="M0 230 L120 120 L220 200 L300 140 L480 240 L480 270 L0 270 Z" fill="#ffffff" fill-opacity="0.45"/>
    <path d="M0 250 L90 190 L180 240 L280 180 L480 260 L480 270 L0 270 Z" fill="#ffffff" fill-opacity="0.3"/>
    <text x="32" y="48" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="600">lumina</text>
  </svg>`,
)}`;

/** 不是合法的 PNG，浏览器解码必然失败，用来展示失败态。 */
const BROKEN_SRC = 'data:image/png;base64,AAAA';

const meta = {
  title: 'Components/ImagePreview',
  component: ImagePreview,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    src: SAMPLE_SRC,
    alt: '示例图片：紫色的山景插画',
    loadingLabel: '图片加载中…',
    failedLabel: '图片加载失败',
  },
  argTypes: {
    src: {
      control: 'text',
      description: '图片地址；换图会重置内部的加载状态',
    },
    alt: {
      control: 'text',
      description: '图片替代文本，同时作为图片的无障碍名称',
    },
    loadingLabel: {
      control: 'text',
      description: '加载中的状态文案',
    },
    failedLabel: {
      control: 'text',
      description: '加载失败的状态文案',
    },
  },
} satisfies Meta<typeof ImagePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 加载中：图片就绪前显示图标与文案，就绪后图片淡入。本地 data URI 完成得很快，接入网络图片时该状态更明显。 */
export const Loading: Story = {
  args: { loadingLabel: '图片加载中…' },
};

/** 加载完成：图片淡入，状态层消失。 */
export const Loaded: Story = {
  args: { src: SAMPLE_SRC },
};

/** 加载失败：解码失败后不再渲染 `<img>`，只保留失败文案。 */
export const Failed: Story = {
  args: { src: BROKEN_SRC },
};
