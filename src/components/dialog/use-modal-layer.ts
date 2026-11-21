import { useEffect, useRef, type RefObject } from 'react';

/** 面板内可参与 Tab 循环的元素选择器；`tabIndex` 会在运行时再过滤一次。 */
const TABBABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button',
  'input',
  'select',
  'textarea',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]',
].join(',');

/** 收集当前真正可聚焦的子元素，过滤禁用、隐藏与 `tabindex="-1"`。 */
function getTabbables(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.tabIndex >= 0 &&
      element.getClientRects().length > 0,
  );
}

interface UseModalLayerOptions {
  /** 是否处于打开状态。 */
  open: boolean;
  /** 对话框面板节点，焦点陷阱与初始焦点都以它为边界。 */
  panelRef: RefObject<HTMLElement | null>;
  /** 是否允许 Esc 关闭。 */
  closeOnEsc: boolean;
  /** 请求关闭时调用。 */
  onClose: () => void;
}

/**
 * 模态层行为集合：滚动锁、打开/关闭时的焦点交接、Tab 焦点陷阱与 Esc 关闭。
 * 只在客户端 effect 中访问 DOM，因此可以安全地在 SSR 中调用。
 */
export function useModalLayer({ open, panelRef, closeOnEsc, onClose }: UseModalLayerOptions): void {
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // 滚动锁：记录 body 原有的 overflow / padding-right，关闭时原样恢复。
  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;
    // innerWidth 包含滚动条，clientWidth 不包含，两者之差就是滚动条占位。
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPadding = Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // 焦点交接：打开时记住触发元素并把焦点移入面板，关闭/卸载时归还。
  useEffect(() => {
    if (!open) return;
    const activeElement = document.activeElement;
    restoreFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null;

    const panel = panelRef.current;
    if (panel) {
      const [firstTabbable] = getTabbables(panel);
      (firstTabbable ?? panel).focus({ preventScroll: true });
    }

    return () => {
      const target = restoreFocusRef.current;
      restoreFocusRef.current = null;
      if (target && target.isConnected) {
        target.focus({ preventScroll: true });
      }
    };
  }, [open, panelRef]);

  // 键盘：Tab/Shift+Tab 在面板内循环，Esc 按需关闭。
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        if (!closeOnEsc || event.defaultPrevented) return;
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;

      const tabbables = getTabbables(panel);
      if (tabbables.length === 0) {
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }

      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      const active = document.activeElement;
      const isInside = active instanceof HTMLElement && active !== panel && panel.contains(active);

      if (event.shiftKey) {
        if (!isInside || active === first) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (!isInside || active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [open, closeOnEsc, onClose, panelRef]);
}
