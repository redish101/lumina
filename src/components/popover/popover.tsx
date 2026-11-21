'use client';

import {
  cloneElement,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import css from './popover.module.css';

/** 浮层相对触发器的方位。 */
export type PopoverSide = 'top' | 'bottom' | 'left' | 'right';

/** 浮层与触发器在交叉轴上的对齐方式。 */
export type PopoverAlign = 'start' | 'center' | 'end';

export type PopoverProps = {
  /** 浮层内容。 */
  content: ReactNode;
  /** 触发器元素；必须是单个元素，点击它切换浮层。 */
  children: ReactElement;
  /** 首选的方位，空间不足时自动翻转到对侧，默认 `bottom`。 */
  side?: PopoverSide;
  /** 交叉轴对齐方式，默认 `start`。 */
  align?: PopoverAlign;
  /** 浮层与触发器之间的间距（px），默认 8。 */
  offset?: number;
  /** 受控的打开状态；提供时组件不再自行维护状态。 */
  open?: boolean;
  /** 非受控模式下的初始打开状态。 */
  defaultOpen?: boolean;
  /** 打开状态变化时触发。 */
  onOpenChange?: (open: boolean) => void;
  /** 点击浮层与触发器之外的位置是否关闭，默认 true。 */
  closeOnOutsideClick?: boolean;
  /** 按 Esc 是否关闭并把焦点归还触发器，默认 true。 */
  closeOnEsc?: boolean;
  /** 追加在浮层面板上的类名。 */
  className?: string;
};

type TriggerA11yProps = {
  'aria-haspopup'?: 'dialog';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
};

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const OPPOSITE_SIDE: Record<PopoverSide, PopoverSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** 判断首选方位是否放得下，放不下且对侧更宽裕时翻转。 */
function resolveSide(
  preferred: PopoverSide,
  anchorRect: DOMRect,
  width: number,
  height: number,
  offset: number,
  viewportWidth: number,
  viewportHeight: number,
): PopoverSide {
  const margin = 12;
  const available: Record<PopoverSide, number> = {
    top: anchorRect.top - margin,
    bottom: viewportHeight - anchorRect.bottom - margin,
    left: anchorRect.left - margin,
    right: viewportWidth - anchorRect.right - margin,
  };
  const needed = {
    top: height + offset,
    bottom: height + offset,
    left: width + offset,
    right: width + offset,
  };
  if (available[preferred] >= needed[preferred]) return preferred;
  const fallback = OPPOSITE_SIDE[preferred];
  return available[fallback] > available[preferred] ? fallback : preferred;
}

/**
 * 点击触发器弹出的非模态浮层，内容渲染到 body 并相对触发器定位。
 *
 * 浮层用 `position: fixed` 在布局阶段测量锚点后写入坐标，空间不足时翻转到
 * 对侧并把位置夹在视口内；关闭动画结束后才卸载，Esc 会把焦点归还触发器。
 */
export function Popover({
  content,
  children,
  side = 'bottom',
  align = 'start',
  offset = 8,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  closeOnOutsideClick = true,
  closeOnEsc = true,
  className,
}: PopoverProps) {
  const baseId = useId();
  const panelId = `${baseId}-panel`;
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [exiting, setExiting] = useState(false);

  const open = controlledOpen ?? innerOpen;
  const mounted = open || exiting;

  const changeOpen = useCallback(
    (next: boolean) => {
      if (controlledOpen === undefined) setInnerOpen(next);
      setExiting(!next);
      onOpenChange?.(next);
    },
    [controlledOpen, onOpenChange],
  );

  const restoreFocus = useCallback(() => {
    const anchor = anchorRef.current;
    if (anchor === null) return;
    const target = anchor.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (target ?? anchor).focus();
  }, []);

  // 打开后把焦点送进面板：优先第一个可聚焦元素，没有则让面板自身接管。
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel === null) return;
    const focusable = panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    (focusable ?? panel).focus();
  }, [open]);

  // 退出动画期间面板仍留在 DOM 里，120ms 后再真正卸载。
  useEffect(() => {
    if (!exiting) return;
    const timer = window.setTimeout(() => {
      setExiting(false);
    }, 120);
    return () => {
      window.clearTimeout(timer);
    };
  }, [exiting]);

  // 外部点击与 Esc；两者都只注册在打开期间，关闭后立即移除。
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!closeOnOutsideClick) return;
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) === true) return;
      if (anchorRef.current?.contains(target) === true) return;
      changeOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (!closeOnEsc || event.key !== 'Escape') return;
      event.preventDefault();
      changeOpen(false);
      restoreFocus();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, closeOnOutsideClick, closeOnEsc, changeOpen, restoreFocus]);

  // 直接量 offsetWidth/offsetHeight 而不是 getBoundingClientRect，避免进出场的
  // scale 变换污染尺寸；坐标写在 DOM 上而不是 state 里，省掉一次额外提交。
  useLayoutEffect(() => {
    if (!mounted) return;
    const anchor = anchorRef.current;
    const panel = panelRef.current;
    if (anchor === null || panel === null) return;

    const update = () => {
      const anchorRect = anchor.getBoundingClientRect();
      const width = panel.offsetWidth;
      const height = panel.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 12;
      const resolved = resolveSide(
        side,
        anchorRect,
        width,
        height,
        offset,
        viewportWidth,
        viewportHeight,
      );

      let top: number;
      let left: number;
      if (resolved === 'top' || resolved === 'bottom') {
        top = resolved === 'bottom' ? anchorRect.bottom + offset : anchorRect.top - offset - height;
        if (align === 'start') left = anchorRect.left;
        else if (align === 'center') left = anchorRect.left + (anchorRect.width - width) / 2;
        else left = anchorRect.right - width;
      } else {
        left = resolved === 'right' ? anchorRect.right + offset : anchorRect.left - offset - width;
        if (align === 'start') top = anchorRect.top;
        else if (align === 'center') top = anchorRect.top + (anchorRect.height - height) / 2;
        else top = anchorRect.bottom - height;
      }

      const maxLeft = Math.max(margin, viewportWidth - width - margin);
      const maxTop = Math.max(margin, viewportHeight - height - margin);
      left = Math.min(Math.max(left, margin), maxLeft);
      top = Math.min(Math.max(top, margin), maxTop);

      panel.dataset.side = resolved;
      panel.style.top = `${Math.round(top)}px`;
      panel.style.left = `${Math.round(left)}px`;
      panel.style.visibility = 'visible';
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(anchor);
    observer.observe(panel);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [mounted, side, align, offset]);

  const trigger = cloneElement(children as ReactElement<TriggerA11yProps>, {
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': panelId,
  });

  const panel = (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      tabIndex={-1}
      aria-hidden={!open}
      inert={!open}
      data-state={open ? 'open' : 'closed'}
      className={clsx(css.panel, className)}
    >
      {content}
    </div>
  );

  return (
    <>
      <span
        ref={anchorRef}
        tabIndex={-1}
        className={css.anchor}
        onClick={() => {
          changeOpen(!open);
        }}
      >
        {trigger}
      </span>
      {mounted && typeof document !== 'undefined' ? createPortal(panel, document.body) : null}
    </>
  );
}
