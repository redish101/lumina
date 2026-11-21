'use client';

/** 管理单个菜单的子级布局模式、指针宽限期与焦点转移。 */
import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject, SyntheticEvent } from 'react';
import type { MenuEntry, MenuItem } from './menu';
import { submenuNeedsPage } from './menu-submenu-position';
import { usePointerGrace } from './pointer-grace';

/**
 * 指针事件是否可以请求悬停交互。
 * @param event - 当前指针事件，包含混合输入的触摸事件。
 * @returns 非触摸输入且设备支持悬停时为 true。
 */
export function menuHoverAllowed(event: { pointerType: string }): boolean {
  return event.pointerType !== 'touch' && window.matchMedia('(any-hover: hover)').matches;
}

/** 一个菜单的子级卡片状态与交互操作。 */
export interface MenuSubmenu {
  entry: (MenuItem & { submenu: readonly MenuEntry[] }) | undefined;
  panelRef: RefObject<HTMLDivElement | null>;
  /** 根卡片锚点盒的 CSS 锚点名称；子卡片以它为定位基准。 */
  parentAnchor: string;
  /** 当前子级的布局模式是否已知；未知时子卡片保持隐藏。 */
  measured: boolean;
  page: boolean;
  hidden: boolean;
  contains: (node: Node | null) => boolean;
  activeList: (focused: Node | null) => HTMLDivElement | null;
  /** 没有可见子级可以处理这次导航时返回 false。 */
  returnToParent: () => boolean;
  openChild: (id: string, target: HTMLButtonElement, enter?: boolean) => void;
  focusParent: (id: string, target: HTMLButtonElement) => void;
  leave: () => void;
  cancelClose: () => void;
  collapseFrom: (event: SyntheticEvent<HTMLDivElement>) => void;
}

/**
 * 管理一张子卡片，但不接管根菜单的文档监听。
 * @param options - 当前条目、根菜单生命周期与焦点兜底目标。
 * @returns 子级渲染数据与细粒度的交互操作。
 */
export function useMenuSubmenu(options: {
  open: boolean;
  items: readonly MenuEntry[];
  footer: readonly MenuEntry[] | undefined;
  listRef: RefObject<HTMLDivElement | null>;
  refocusAnchor: () => void;
}): MenuSubmenu {
  const { open, items, footer, listRef, refocusAnchor } = options;
  const [expanded, setExpanded] = useState<{
    id: string;
    trigger: HTMLButtonElement;
    activated: boolean;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // 存在 DOM 目标时，抑制它的「聚焦即展开」处理器，直到焦点恢复完成。
  const pendingFocus = useRef<'child' | HTMLButtonElement | null>(null);
  const entry = [...items, ...(footer ?? [])].find(
    (item): item is MenuItem & { submenu: readonly MenuEntry[] } =>
      !('type' in item) &&
      item.id === expanded?.id &&
      item.disabled !== true &&
      item.submenu !== undefined &&
      item.submenu.length > 0,
  );
  const trigger = expanded?.trigger ?? null;
  const anchorId = useId().replaceAll(':', '');
  const parentAnchor = `--dsh-submenu-parent-${anchorId}`;
  // 当前子卡片尚未针对布局视口测量时为 null。
  const [needsPage, setNeedsPage] = useState<boolean | null>(null);
  const contains = (node: Node | null): boolean => panelRef.current?.contains(node) === true;
  const invalidated = expanded !== null && entry === undefined;
  // 这些读取发生在 React 移除失效面板或整页布局的返回行之前。SSR 时没有
  // `document`，此时按「焦点不在菜单里」处理，与客户端首次渲染一致。
  const active = typeof document === 'undefined' ? null : document.activeElement;
  // 必须在 React 卸载失效面板之前读出焦点归属：等布局效应跑起来，被聚焦的
  // 面板已经从 DOM 里消失，只剩 body 可读，会把无关的卸载误判成需要归还焦点。
  const restoreInvalidatedFocus = open && invalidated && (contains(active) || trigger === active);
  const backWasFocused = contains(active) && active?.hasAttribute('data-menu-back') === true;
  const measured = needsPage !== null;
  const page = entry !== undefined && expanded?.activated === true && needsPage === true;
  const hidden = !measured || (needsPage && !page);
  // CSS 锚点把子卡片贴到父卡片上。JavaScript 只负责选布局并给出两个长度：
  // 卡片的自然高度，以及当前行相对父卡片顶部的偏移。两者都是相对尺寸，
  // 因此页面缩放与平移不会让它们失效。
  const visible = open && entry !== undefined;
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const parent = listRef.current;
    if (!visible || panel === null || parent === null || trigger === null) {
      setNeedsPage(null);
      return;
    }
    const measureRow = (): void => {
      panel.style.setProperty(
        '--dsh-submenu-row-offset',
        `${trigger.getBoundingClientRect().top - parent.getBoundingClientRect().top}px`,
      );
    };
    // 布局取侧边卡片的自然尺寸，而不是整页布局给它的尺寸。
    const measure = (): void => {
      const layout = panel.getAttribute('data-submenu-layout');
      panel.removeAttribute('data-submenu-layout');
      const width = panel.offsetWidth;
      panel.style.setProperty('--dsh-submenu-height', `${panel.offsetHeight}px`);
      if (layout !== null) panel.setAttribute('data-submenu-layout', layout);
      measureRow();
      const viewport = document.documentElement.clientWidth || window.innerWidth;
      setNeedsPage(submenuNeedsPage(parent.getBoundingClientRect(), width, viewport));
    };
    measure();
    window.addEventListener('resize', measure);
    parent.addEventListener('scroll', measureRow, true);
    const observer = new ResizeObserver(measure);
    for (const element of [parent, trigger, panel]) observer.observe(element);
    return () => {
      window.removeEventListener('resize', measure);
      parent.removeEventListener('scroll', measureRow, true);
      observer.disconnect();
    };
  }, [visible, entry, trigger, listRef]);
  const focusFirstChild = (): void => {
    const panel = panelRef.current;
    const first =
      panel?.querySelector<HTMLButtonElement>(
        'button[role="menuitem"]:not(:disabled):not([data-menu-back])',
      ) ?? panel?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    first?.focus();
  };
  // 宽限期回调先声明，两个具名函数靠提升在后面定义，避免 const 之间的循环引用。
  const { arm: armClose, cancel: cancelClose } = usePointerGrace(() => {
    if (!page) collapse();
  });
  function returnToParent(): void {
    cancelClose();
    pendingFocus.current = trigger;
    setExpanded(null);
  }
  function collapse(): void {
    cancelClose();
    if (contains(document.activeElement)) returnToParent();
    else setExpanded(null);
  }
  const openChild = (id: string, target: HTMLButtonElement, enter = false): void => {
    cancelClose();
    if (trigger !== target && contains(document.activeElement)) {
      pendingFocus.current = target;
      target.focus();
      pendingFocus.current = null;
    }
    pendingFocus.current = enter ? 'child' : null;
    setExpanded((current) =>
      current?.id === id
        ? enter && !current.activated
          ? { ...current, activated: true }
          : current
        : { id, trigger: target, activated: enter },
    );
    if (enter) focusFirstChild();
  };
  useLayoutEffect(() => {
    if (!open || invalidated) {
      cancelClose();
      pendingFocus.current = null;
      // 必须在同一次布局里清掉失效的展开项：面板正随本次提交卸载，
      // 留到微任务再清会让归还焦点的判断看到已经变形的 DOM。
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 同上，同步重置对焦点归还时序是必要的。
      setExpanded(null);
      if (
        restoreInvalidatedFocus &&
        (document.activeElement === document.body || document.activeElement === trigger)
      ) {
        const target =
          trigger?.isConnected === true && !trigger.disabled
            ? trigger
            : listRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
        pendingFocus.current = target ?? null;
        if (target != null) target.focus();
        else refocusAnchor();
        pendingFocus.current = null;
      }
      return;
    }
    if (entry === undefined && pendingFocus.current instanceof HTMLButtonElement) {
      pendingFocus.current.focus();
      pendingFocus.current = null;
    }
    if (entry === undefined || hidden) return;
    if (
      pendingFocus.current === 'child' ||
      (page && listRef.current?.contains(document.activeElement)) ||
      (!page && backWasFocused)
    ) {
      focusFirstChild();
      pendingFocus.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 焦点结算只在打开项变化时执行，refs 与回调进依赖会重复结算
  }, [
    open,
    entry,
    needsPage,
    page,
    hidden,
    invalidated,
    restoreInvalidatedFocus,
    backWasFocused,
    cancelClose,
  ]);

  const collapseFrom = (event: SyntheticEvent<HTMLDivElement>): void => {
    // React DOM 会把文本节点的事件目标归一化到它的父元素。
    const row = (event.target as Element).closest('button[role="menuitem"]');
    if (row === null || row.getAttribute('aria-haspopup') === 'menu') return;
    if (row.closest('[role="menu"]') === event.currentTarget) collapse();
  };
  return {
    entry,
    panelRef,
    parentAnchor,
    measured,
    page,
    hidden,
    contains,
    activeList: (focused: Node | null) =>
      page || contains(focused) ? panelRef.current : listRef.current,
    returnToParent: (): boolean => {
      if (entry === undefined || hidden) return false;
      returnToParent();
      return true;
    },
    openChild,
    focusParent: (id: string, target: HTMLButtonElement): void => {
      if (pendingFocus.current !== target) openChild(id, target);
    },
    leave: (): void => {
      if (!page) armClose();
    },
    cancelClose,
    collapseFrom,
  };
}
