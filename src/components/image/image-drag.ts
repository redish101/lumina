/** 图片手势只负责准备文件，真正的传输交给持有文件的应用层。 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type DragEvent,
  type ImgHTMLAttributes,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import type { FileDragActions, FileDragSource, PreparedFileDrag } from './file-drag-actions';

interface Preparation {
  abort: AbortController;
  prepared?: PreparedFileDrag;
  failed: boolean;
}

type ImageGestures = Required<
  Pick<
    ImgHTMLAttributes<HTMLImageElement>,
    | 'onPointerEnter'
    | 'onPointerDown'
    | 'onPointerLeave'
    | 'onDragStart'
    | 'onDragEnd'
    | 'onClickCapture'
  >
>;

/**
 * 资源型图片在主键按下时准备，其它图片额外在悬停时准备；离开时释放。
 * 在图片内部松开指针会保留准备结果供下一次手势复用；被取消的拖拽不会迟到启动。
 * @param actions - 稳定的文件准备与错误回调。
 * @param src - 当前展示的图片地址。
 * @param name - 建议的导出文件名。
 * @param original - 已经加载好的原始文件字节。
 * @param resourceAddress - 指向未修改本机原件的可校验引用。
 * @returns 图片手势处理器；可平移的溢出图片仍由自己的平移逻辑接管。
 */
export function useImageDrag(
  actions: FileDragActions,
  src: string,
  name: string,
  original?: File,
  resourceAddress?: string,
): ImageGestures {
  const source = useMemo<FileDragSource>(
    () =>
      original === undefined
        ? { kind: 'url', url: src, name, mediaType: '', resourceAddress }
        : {
            kind: 'blob',
            blob: original,
            name,
            mediaType: original.type,
            resourceAddress,
          },
    [src, name, original, resourceAddress],
  );
  const state = useRef<Preparation>(undefined);
  const dragged = useRef(false);
  const release = useCallback((): void => {
    const previous = state.current;
    state.current = undefined;
    previous?.abort.abort();
    previous?.prepared?.release();
  }, []);
  useEffect(() => release, [release, source, actions]);
  const prepare = useCallback(
    (image: HTMLImageElement): void => {
      if (src === '' || state.current !== undefined) return;
      const current: Preparation = { abort: new AbortController(), failed: false };
      state.current = current;
      window.addEventListener(
        'pointerup',
        (event) => {
          if (event.target !== image) release();
        },
        { signal: current.abort.signal },
      );
      window.addEventListener('blur', release, { once: true, signal: current.abort.signal });
      void actions.prepare(source, current.abort.signal).then(
        (prepared) => {
          if (current.abort.signal.aborted) prepared.release();
          else current.prepared = prepared;
        },
        () => {
          // 预判阶段保持安静；只有后续真正失败的手势才展示重试反馈。
          current.failed = true;
        },
      );
    },
    [src, actions, source, release],
  );
  const intent = useCallback(
    (event: PointerEvent<HTMLImageElement>): void => {
      if (
        !event.defaultPrevented &&
        event.currentTarget.draggable &&
        (resourceAddress === undefined || event.type === 'pointerdown')
      ) {
        prepare(event.currentTarget);
      }
    },
    [prepare, resourceAddress],
  );
  const onDragStart = useCallback(
    (event: DragEvent<HTMLImageElement>): void => {
      if (event.defaultPrevented || src === '') return;
      dragged.current = true;
      const current = state.current;
      if (current?.prepared !== undefined) {
        if (!current.prepared.start(event.dataTransfer, event.currentTarget)) {
          event.preventDefault();
          release();
        }
        return;
      }
      const url = new URL(src, location.href);
      if (
        original === undefined &&
        (url.protocol === 'https:' || url.protocol === 'http:') &&
        url.origin !== location.origin
      ) {
        return;
      }
      event.preventDefault();
      if (current?.failed === true) {
        actions.reportFailure();
        release();
      }
      prepare(event.currentTarget);
    },
    [src, original, actions, prepare, release],
  );
  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLImageElement>): void => {
      dragged.current = false;
      if (event.button === 0) intent(event);
    },
    [intent],
  );
  const onPointerLeave = useCallback(
    (event: PointerEvent<HTMLImageElement>): void => {
      // 小图可能会在 dragstart 派发前就收到 pointerleave。
      if (event.buttons !== 1) release();
    },
    [release],
  );
  const onClickCapture = useCallback((event: MouseEvent): void => {
    if (event.detail === 0) {
      dragged.current = false;
      return;
    }
    if (!dragged.current) return;
    event.preventDefault();
    event.stopPropagation();
    dragged.current = false;
  }, []);
  return {
    onPointerEnter: intent,
    onPointerDown,
    onPointerLeave,
    onDragStart,
    onDragEnd: release,
    onClickCapture,
  };
}
