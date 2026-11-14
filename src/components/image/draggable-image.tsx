'use client';

/** 由展示层持有的原图拖拽手势。 */
import { forwardRef, type ImgHTMLAttributes } from 'react';
import { useImageDrag } from './image-drag';
import type { FileDragActions } from './file-drag-actions';

/** 图片展示信息，加上原始内容与显式的文件准备回调。 */
export interface DraggableImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  | 'src'
  | 'draggable'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onPointerEnter'
  | 'onPointerLeave'
  | 'onPointerDown'
  | 'onPointerUp'
  | 'onClickCapture'
> {
  /** 文件准备与失败反馈回调，由应用层提供 */
  readonly fileDrag: FileDragActions;
  /** 展示用的图片地址 */
  readonly src: string;
  /** 建议的导出文件名 */
  readonly name: string;
  /** 指向未修改本机原件的可校验引用 */
  readonly resourceAddress?: string | undefined;
  /** 已经加载好的原始文件；提供后拖拽直接使用原始字节 */
  readonly original?: File | undefined;
}

/**
 * 可拖出原文件的图片，文件准备完全交给应用层的 `fileDrag` 回调。
 *
 * 只抑制紧随拖拽之后的那一次鼠标点击，普通点击与键盘激活不受影响。
 */
export const DraggableImage = forwardRef<HTMLImageElement, DraggableImageProps>(
  function DraggableImage({ fileDrag, src, name, original, resourceAddress, ...props }, ref) {
    const drag = useImageDrag(fileDrag, src, name, original, resourceAddress);
    return <img {...props} {...drag} src={src} ref={ref} draggable />;
  },
);
