/** 文件拖拽的稳定准备回调，由持有传输能力的一端（插件/应用层）提供。 */

/**
 * 导出命名约定。
 *
 * 上游从 `@deepseek-ai/dsh-util-file-drag` 引入；本库不依赖该包，
 * 这里就地内联一份等价定义，保证类型自洽。
 */
export interface DragFileName {
  readonly name?: string | undefined;
  readonly mediaType: string;
  readonly outputExtension?: string | undefined;
}

/** 文件内容来源，以及可选的本机原始文件的可校验标识。 */
export type FileDragSource = DragFileName & { readonly resourceAddress?: string | undefined } & (
    { readonly kind: 'blob'; readonly blob: Blob } | { readonly kind: 'url'; readonly url: string }
  );

/** 已经准备好的拖拽操作；release 只回收未使用的资源，不会中断进行中的浏览器传输。 */
export interface PreparedFileDrag {
  /**
   * 在浏览器仍允许写入 payload 的时间点启动准备好的一次传输。
   * @param transfer - 可写的 dragstart payload。
   * @param source - 原生来源节点，需保持到 dragend。
   * @returns 返回 `true` 表示继续由浏览器拖拽；`false` 表示交给原生拖拽接管。
   */
  start(transfer: DataTransfer, source: HTMLElement): boolean;
  /** 指针离开或来源卸载后回收这次准备。 */
  release(): void;
}

/** 展示层只看到「准备」与「失败反馈」；具体走哪种传输由插件决定。 */
export interface FileDragActions {
  /**
   * @param source - 文件内容与导出名。
   * @param signal - 准备过程的取消信号。
   * @returns 可执行 start/release 的已就绪操作。
   */
  prepare(source: FileDragSource, signal: AbortSignal): Promise<PreparedFileDrag>;
  /** 展示插件提供的本地化重试提示，与发起组件解耦。 */
  reportFailure(): void;
}
