'use client';

/** 锚定在锚点上的提示气泡；可选的 body portal 用来跳出祖先的裁剪与层叠上下文。 */

import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type {
  FocusEventHandler,
  MouseEventHandler,
  MutableRefObject,
  PointerEventHandler,
  ReactElement,
  Ref,
} from 'react';
import { createPortal } from 'react-dom';
import { ShortcutKeys } from '../shortcut-keys';
import { placeTooltip, type TooltipSide } from './tooltip-placement';
import { useDismissOnOutsidePointer } from './use-dismiss-on-outside-pointer';
import css from './tooltip.module.css';
// Tooltips take the wide answer — any key returns to the keyboard. Focus rings read the
// narrower `data-input-modality` attribute the same module publishes.
import { pointerModality } from './input-modality';

export type { TooltipSide } from './tooltip-placement';

/**
 * Suppression channel for nested tooltips: a visible descendant tooltip
 * withdraws the enclosing tooltip while its bubble is shown.
 */
export const TooltipSuppression = createContext<((suppressed: boolean) => void) | null>(null);

/** Props Tooltip injects into its anchor child; the child's own handlers are chained ahead of the tooltip's. */
interface AnchorProps {
  'aria-describedby'?: string | undefined;
  ref?: Ref<HTMLElement> | undefined;
  onPointerEnter?: PointerEventHandler | undefined;
  onPointerLeave?: PointerEventHandler | undefined;
  onPointerDown?: PointerEventHandler | undefined;
  onClick?: MouseEventHandler | undefined;
  onFocus?: FocusEventHandler | undefined;
  onBlur?: FocusEventHandler | undefined;
}

/** 气泡文案：字符串，或仅在可见时才求值的取文案函数。 */
export type TooltipLabel = string | (() => string);

export type TooltipProps = {
  /** 气泡文案；传空字符串则只显示快捷键。传函数时只在气泡可见时求值。 */
  label: TooltipLabel;
  /** 可选的快捷键标签，渲染成平台风格的键帽，排在文案之后。 */
  shortcutKeys?: readonly string[] | undefined;
  /** 期望方位，默认 `right`；放不下时依次尝试对面与垂直方向。 */
  side?: TooltipSide;
  /** 上/下气泡贴哪条水平边：`end` 让气泡右边缘对齐锚点右边缘，默认 `center`。 */
  align?: 'center' | 'end';
  /** 悬停延迟（毫秒），默认 0。 */
  delayMs?: number;
  /** 键盘聚焦延迟（毫秒），默认 0；失焦、点击、移出、禁用、卸载都会取消待显示。 */
  focusDelayMs?: number;
  /** 上/下气泡与锚点的间距（像素），默认 8；左右气泡固定 10px。 */
  gap?: number;
  /** 为 true 时抑制气泡；锚点仍照常渲染，切换不会重挂锚点。 */
  disabled?: boolean;
  /** 把气泡 portal 到 `document.body`，避开祖先裁剪与层叠上下文。 */
  portal?: boolean;
  /** 气泡宽度上限（像素），仍受视口边距约束。 */
  maxWidth?: number;
  /** 点击/轻触也把气泡钉住以便阅读；再次点击、Escape、Tab 或外部指针按下会关闭。 */
  openOnClick?: boolean;
  /** 只在锚点（或其内部元素）横向溢出时才显示，用于被省略号截断的标签。 */
  onlyWhenClipped?: boolean;
  /** 单个锚点元素；它自己的 ref 会与 Tooltip 的 ref 合并。 */
  children: ReactElement<AnchorProps>;
};

function clipped(anchor: HTMLElement): boolean {
  return [anchor, ...anchor.querySelectorAll<HTMLElement>('*')].some(
    (el) => el instanceof HTMLElement && el.scrollWidth > el.clientWidth,
  );
}

/**
 * 给一个锚点元素挂悬停/聚焦提示。
 *
 * 气泡量到尺寸前保持不可见，默认贴锚点边缘，放不下时翻到对面或垂直方向；
 * `portal` 为 true 时渲染到 `document.body`，避开祖先的裁剪与层叠上下文。
 */
export function Tooltip({
  label,
  shortcutKeys,
  side = 'right',
  align = 'center',
  delayMs = 0,
  focusDelayMs = 0,
  gap = 8,
  disabled = false,
  portal = false,
  maxWidth,
  openOnClick = false,
  onlyWhenClipped = false,
  children,
}: TooltipProps) {
  const id = useId();
  const [pinned, setPinned] = useState(false);
  const anchor = useRef<HTMLElement | null>(null);
  // React 18 keeps the element's ref outside props; forward it so wrapping an
  // anchor in Tooltip never silently severs the owner's ref.
  const childRef = (children as ReactElement<AnchorProps> & { ref?: Ref<HTMLElement> }).ref;
  /* eslint-disable react-hooks/immutability -- React 18 keeps an element's ref outside
     props, so forwarding it onto the cloned anchor means writing the child's ref object;
     that is the only way wrapping an anchor does not sever its owner's ref. */
  const mergedRef = useCallback(
    (el: HTMLElement | null) => {
      anchor.current = el;
      if (typeof childRef === 'function') childRef(el);
      else if (childRef != null) (childRef as MutableRefObject<HTMLElement | null>).current = el;
    },
    [childRef],
  );
  /* eslint-enable react-hooks/immutability */
  const [pos, setPos] = useState<DOMRect | null>(null);
  const bubble = useRef<HTMLSpanElement | null>(null);
  const resolvedLabel = pos === null ? null : typeof label === 'function' ? label() : label;
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Hover and focus are independent triggers: the bubble hides only after
  // BOTH clear (hovering away from a focused anchor must not drop it).
  const triggers = useRef({ hover: false, focus: false });

  // A nested tooltip's bubble owns the pointer position, so this tooltip
  // withdraws its own while a descendant shows one; the state below is set by
  // the descendants this tooltip wraps. Announcing on every visibility change
  // covers hide, disable, and unmount; show() also announces synchronously so
  // a nested pair shown in one commit never paints both bubbles.
  const suppressAncestors = useContext(TooltipSuppression);
  const [suppressed, setSuppressed] = useState(false);
  const announce = useCallback(
    (active: boolean) => {
      suppressAncestors?.(active);
    },
    [suppressAncestors],
  );
  const visible = pos !== null && !disabled;
  // ResizeObserver supplies the laid-out border box; fitting never reads
  // geometry after a position write or needs a React commit to flip sides.
  useEffect(() => {
    const el = bubble.current;
    if (pos === null || !visible || suppressed || el === null) return;
    let size: ResizeObserverSize | undefined;
    let anchorRect = pos;
    const fit = () => {
      if (size === undefined) return;
      const placement = placeTooltip({
        anchor: anchorRect,
        width: size.inlineSize,
        height: size.blockSize,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        side,
        align,
        gap,
      });
      const horizontal = placement.side === 'right' || placement.side === 'left';
      const offsetX = horizontal ? 0 : align === 'end' ? placement.width : placement.width / 2;
      const offsetY = horizontal
        ? placement.height / 2
        : placement.side === 'top'
          ? placement.height
          : 0;
      el.style.left = `${placement.left + offsetX}px`;
      el.style.top = `${placement.top + offsetY}px`;
      el.dataset.side = placement.side;
      el.style.visibility = 'visible';
    };
    const onResize = () => {
      if (anchor.current !== null) anchorRect = anchor.current.getBoundingClientRect();
      fit();
    };
    const observer = new ResizeObserver((entries) => {
      size = entries[0]?.borderBoxSize[0];
      fit();
    });
    observer.observe(el, { box: 'border-box' });
    window.addEventListener('resize', onResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [align, gap, pos, side, suppressed, visible]);
  useEffect(() => {
    announce(visible);
    return () => {
      announce(false);
    };
  }, [announce, visible]);

  // Disabling mid-hover (e.g. clicking a rail control expands the sidebar)
  // must drop an already-visible bubble: no mouseleave fires.
  const cancelShow = useCallback(() => {
    if (showTimer.current === null) return;
    clearTimeout(showTimer.current);
    showTimer.current = null;
  }, []);
  useEffect(() => {
    // A pin must drop in the same commit that hides the bubble.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pinned && (disabled || !openOnClick)) setPinned(false);
    if (disabled) {
      cancelShow();
      triggers.current = { hover: false, focus: false };
      setPos(null);
    }
    return cancelShow;
  }, [cancelShow, disabled, openOnClick, pinned]);

  const show = () => {
    if (disabled) return;
    const el = anchor.current;
    // The ref is attached by event time: events fire on the cloned anchor.
    if (el === null) return;
    if (onlyWhenClipped && !clipped(el)) return;
    setPos(el.getBoundingClientRect());
    announce(true);
  };
  const showAfterDelay = (delay: number) => {
    cancelShow();
    if (delay <= 0) {
      show();
      return;
    }
    showTimer.current = setTimeout(() => {
      showTimer.current = null;
      show();
    }, delay);
  };
  const withdraw = useCallback(() => {
    setPinned(false);
    setPos(null);
    announce(false);
  }, [announce]);
  const hide = () => {
    cancelShow();
    if (!triggers.current.hover && !triggers.current.focus && !pinned) withdraw();
  };
  const dismiss = useCallback(() => {
    cancelShow();
    triggers.current = { hover: false, focus: false };
    withdraw();
  }, [cancelShow, withdraw]);
  useDismissOnOutsidePointer(anchor, openOnClick && visible, dismiss, bubble);
  useEffect(() => {
    if (!openOnClick || !visible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' && event.key !== 'Tab') return;
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
      }
      dismiss();
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [dismiss, openOnClick, visible]);

  const content = visible && !suppressed && (
    <span
      ref={bubble}
      id={openOnClick ? id : undefined}
      className={css.bubble}
      data-side={side}
      data-portal={portal || undefined}
      data-pinned={pinned || undefined}
      data-align={align}
      data-has-shortcut={shortcutKeys?.length ? true : undefined}
      style={{
        left: pos.left,
        top: pos.top,
        visibility: 'hidden',
        ...(maxWidth === undefined ? {} : { maxWidth: `min(${maxWidth}px, calc(100vw - 24px))` }),
      }}
      role="tooltip"
      aria-label={
        shortcutKeys?.length
          ? [resolvedLabel, shortcutKeys.join(' ')].filter(Boolean).join(' ')
          : undefined
      }
    >
      {resolvedLabel && <span className={css.label}>{resolvedLabel}</span>}
      {shortcutKeys !== undefined && shortcutKeys.length > 0 && (
        <ShortcutKeys keys={shortcutKeys} variant="tooltip" />
      )}
    </span>
  );

  return (
    <TooltipSuppression.Provider value={setSuppressed}>
      {/* eslint-disable-next-line react-hooks/refs -- forwarded to the anchor, never read here. */}
      {cloneElement(children, {
        ref: mergedRef,
        'aria-describedby':
          openOnClick && visible
            ? [children.props['aria-describedby'], id].filter(Boolean).join(' ')
            : children.props['aria-describedby'],
        onPointerEnter: (e) => {
          children.props.onPointerEnter?.(e);
          if (e.pointerType === 'touch') return;
          // iOS can emit mouse entry when a tapped control replaces its icon.
          if (e.pointerType === 'mouse' && !window.matchMedia('(any-hover: hover)').matches) return;
          triggers.current.hover = true;
          showAfterDelay(delayMs);
        },
        onPointerLeave: (e) => {
          children.props.onPointerLeave?.(e);
          triggers.current.hover = false;
          cancelShow();
          if (!pinned) withdraw();
        },
        onPointerDown: (e) => {
          children.props.onPointerDown?.(e);
          if (e.pointerType === 'touch' && !pinned) dismiss();
        },
        // Activating an ordinary action dismisses the bubble: it often changes
        // what the anchor now does (pin → unpin), and the click leaves the
        // anchor focused, which would otherwise pin the relabelled bubble up.
        onClick: (e) => {
          children.props.onClick?.(e);
          triggers.current.focus = false;
          cancelShow();
          if (openOnClick && !disabled && !pinned) {
            setPinned(true);
            show();
          } else withdraw();
        },
        onFocus: (e) => {
          children.props.onFocus?.(e);
          if (pointerModality()) return;
          triggers.current.focus = true;
          showAfterDelay(focusDelayMs);
        },
        onBlur: (e) => {
          children.props.onBlur?.(e);
          triggers.current.focus = false;
          hide();
        },
      })}
      {portal ? content !== false && createPortal(content, document.body) : content}
    </TooltipSuppression.Provider>
  );
}
