'use client';

import { useEffect, useRef, type HTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { IconCloseOutline } from '../../icons';
import css from './image-lightbox.module.css';

/** Lightbox 文案，由调用方按自己的语言环境提供。 */
export interface ImageLightboxLabels {
  /** 预览对话框的无障碍名称 */
  dialog: string;
  /** 关闭控件的无障碍标签 */
  close: string;
}

/** `ImageLightbox` 的 props。 */
export interface ImageLightboxProps {
  /** 原图地址 */
  src: string;
  /** 图片替代文本 */
  alt: string;
  /** 对话框与关闭控件的文案 */
  labels: ImageLightboxLabels;
  /** 可选的原始图片手势绑定 */
  contextMenuProps?: Pick<HTMLAttributes<HTMLElement>, 'onContextMenu' | 'onKeyDown' | 'tabIndex'>;
  /** 由打开方持有的关闭回调 */
  onClose: () => void;
}

/**
 * 点击缩略图后打开的原图预览层。
 *
 * 支持 Esc、点击遮罩、点击关闭按钮三种关闭方式，卸载时把焦点还给打开者。
 * 通过 body portal 渲染：调用方位于 transform/filter 祖先内时，
 * fixed 遮罩会被困在该祖先的盒子里，而不是覆盖整个视口。
 */
export function ImageLightbox({ src, alt, labels, onClose, contextMenuProps }: ImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent): void => {
      // 走 portal 的图片菜单在交还焦点之前独占 Esc 与 Tab。
      if (event.defaultPrevented || document.activeElement?.closest('[role="menu"]')) return;
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
      }
      if (event.key === 'Tab') {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
      restoreRef.current?.focus();
    };
  }, [onClose]);

  return createPortal(
    <div className={css.backdrop} role="dialog" aria-modal="true" aria-label={labels.dialog}>
      <div className={css.stage}>
        <div className={css.mask} aria-hidden="true" onMouseDown={onClose} />
        <img className={css.image} src={src} alt={alt} {...contextMenuProps} />
        <button
          ref={closeRef}
          type="button"
          className={css.close}
          aria-label={labels.close}
          onClick={onClose}
        >
          <IconCloseOutline size={16} />
        </button>
      </div>
    </div>,
    document.body,
  );
}
