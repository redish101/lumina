import { type DragEvent } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { DraggableImage } from './draggable-image';
import type { FileDragActions, FileDragSource, PreparedFileDrag } from './file-drag-actions';

/** 内联 SVG 转成 data URI：不依赖外网图片，离线也能稳定渲染。 */
const SAMPLE_SRC = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160" viewBox="0 0 240 160">
    <defs>
      <linearGradient id="drag-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#a855f7"/>
      </linearGradient>
    </defs>
    <rect width="240" height="160" fill="url(#drag-bg)"/>
    <circle cx="186" cy="42" r="18" fill="#ffffff" fill-opacity="0.35"/>
    <path d="M0 136 L64 76 L118 120 L160 88 L240 142 L240 160 L0 160 Z" fill="#ffffff" fill-opacity="0.45"/>
    <text x="16" y="28" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="600">draggable</text>
  </svg>`,
)}`;

/** 演示用的已就绪操作：把示例地址写进 text/plain，剩下的交给浏览器原生拖拽。 */
function createPreparedDrag(): PreparedFileDrag {
  return {
    start: (transfer) => {
      transfer.setData('text/plain', SAMPLE_SRC);
      return true;
    },
    release: () => {},
  };
}

/** 默认 story 使用的稳定回调：只负责准备，不打印。 */
const SILENT_FILE_DRAG: FileDragActions = {
  prepare: async () => createPreparedDrag(),
  reportFailure: () => {},
};

/** 打印到 Actions 的拖拽开始回调。 */
const handleDragStart = fn((event: DragEvent<HTMLDivElement>) => {
  console.log('[DraggableImage] dragstart', event.dataTransfer.getData('text/plain').slice(0, 48));
});

/** 打印到 Actions 的拖拽结束回调。 */
const handleDragEnd = fn((event: DragEvent<HTMLDivElement>) => {
  console.log('[DraggableImage] dragend', event.dataTransfer.dropEffect);
});

/** 打印到 Actions 的文件准备回调。 */
const handlePrepare = fn(
  async (source: FileDragSource, signal: AbortSignal): Promise<PreparedFileDrag> => {
    console.log('[DraggableImage] prepare', source.kind, source.name, signal.aborted);
    return createPreparedDrag();
  },
);

/** 打印到 Actions 的失败反馈回调。 */
const handleReportFailure = fn((): void => {
  console.warn('[DraggableImage] 文件准备失败，可在此展示重试提示');
});

/** 带日志的文件回调，供 WithDragCallbacks 使用。 */
const LOGGING_FILE_DRAG: FileDragActions = {
  prepare: handlePrepare,
  reportFailure: handleReportFailure,
};

const meta = {
  title: 'Components/DraggableImage',
  component: DraggableImage,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    src: SAMPLE_SRC,
    alt: '可拖拽的示例图片',
    name: 'lumina-sample.svg',
    fileDrag: SILENT_FILE_DRAG,
    style: { width: 240, display: 'block', borderRadius: 12, cursor: 'grab' },
  },
  argTypes: {
    fileDrag: {
      control: false,
      description: '文件准备与失败反馈回调，由应用层提供，决定拖拽时导出什么内容',
    },
    src: {
      control: 'text',
      description: '展示用的图片地址',
    },
    name: {
      control: 'text',
      description: '建议的导出文件名',
    },
    resourceAddress: {
      control: 'text',
      description: '指向未修改本机原件的可校验引用；提供时只在主键按下时准备',
    },
    original: {
      control: false,
      description: '已加载的原始文件；提供后拖拽直接使用原始字节',
    },
    alt: {
      control: 'text',
      description: '图片替代文本，同时作为图片的无障碍名称',
    },
  },
} satisfies Meta<typeof DraggableImage>;

export default meta;

type Story = StoryObj<typeof meta>;

/** 默认可拖拽：按住图片拖到桌面或文件管理器即可触发文件准备。 */
export const Default: Story = {};

/** 带拖拽回调：准备、拖拽开始/结束与失败反馈都会记录到 Actions（`fn` 间谍）并打印到控制台。 */
export const WithDragCallbacks: Story = {
  args: { fileDrag: LOGGING_FILE_DRAG },
  render: (args) => (
    <div onDragStart={handleDragStart} onDragEnd={handleDragEnd} style={{ display: 'inline-flex' }}>
      <DraggableImage {...args} />
    </div>
  ),
};
