'use client';

import {
  forwardRef,
  useId,
  useRef,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useModalLayer } from './use-modal-layer';
import css from './dialog.module.css';

/** 对话框宽度档位：`sm` 360px、`md` 480px、`lg` 720px（均受视口宽度约束）。 */
export type DialogSize = 'sm' | 'md' | 'lg';

export interface DialogProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'children'> {
  /** 是否显示对话框；组件完全受控。 */
  open: boolean;
  /** 请求关闭时调用，通常在这里把 `open` 置为 `false`。 */
  onClose: () => void;
  /** 标题，同时作为对话框的无障碍名称。 */
  title?: ReactNode;
  /** 补充说明，通过 `aria-describedby` 关联到对话框。 */
  description?: ReactNode;
  /** 操作区内容，通常放取消/确认按钮。 */
  actions?: ReactNode;
  /** 对话框正文。 */
  children?: ReactNode;
  /** 宽度档位，默认 `md`。 */
  size?: DialogSize;
  /** 点击遮罩是否关闭，默认 `true`。 */
  closeOnBackdrop?: boolean;
  /** 按 Esc 是否关闭，默认 `true`。 */
  closeOnEsc?: boolean;
  /** 追加到最外层遮罩节点的类名。 */
  className?: string;
}

/**
 * 极简受控对话框：负责 portal、遮罩、焦点陷阱、Esc 关闭与滚动锁，
 * 标题、正文与操作区由调用方自由组合。
 */
export const Dialog = forwardRef<HTMLDivElement, DialogProps>(function Dialog(
  {
    open,
    onClose,
    title,
    description,
    actions,
    children,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEsc = true,
    className,
    ...rest
  },
  ref,
) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useModalLayer({ open, panelRef, closeOnEsc, onClose });

  // 服务端没有 document，也没有必要渲染遮罩。
  if (typeof document === 'undefined') return null;

  const hasHeader = title !== undefined || description !== undefined;
  const hasBody = children !== undefined && children !== null;

  const handleBackdropPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    // 只处理主键，并且指针必须真正按在遮罩上；从面板内拖出不应关闭。
    if (!closeOnBackdrop || event.button !== 0) return;
    if (event.target !== event.currentTarget) return;
    onClose();
  };

  // 关闭后保留 DOM 完成 160ms 的淡出动画；样式上用 visibility + pointer-events 让它不可交互。
  return createPortal(
    <div
      ref={ref}
      className={clsx(css.root, className)}
      data-open={open}
      inert={!open}
      {...rest}
      onPointerDown={handleBackdropPointerDown}
    >
      <div
        ref={panelRef}
        className={clsx(css.panel, css[size])}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title !== undefined ? titleId : undefined}
        aria-describedby={description !== undefined ? descriptionId : undefined}
        tabIndex={-1}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
      >
        {hasHeader ? (
          <header className={css.header}>
            {title !== undefined ? (
              <h2 id={titleId} className={css.title}>
                {title}
              </h2>
            ) : null}
            {description !== undefined ? (
              <p id={descriptionId} className={css.description}>
                {description}
              </p>
            ) : null}
          </header>
        ) : null}
        {hasBody ? <div className={css.body}>{children}</div> : null}
        {actions !== undefined ? <footer className={css.actions}>{actions}</footer> : null}
      </div>
    </div>,
    document.body,
  );
});

Dialog.displayName = 'Dialog';
