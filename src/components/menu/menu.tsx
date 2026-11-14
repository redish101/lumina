'use client';

/** 锚定式下拉菜单：数据行与组件行共享同一套键盘漫游、子菜单与焦点归还逻辑。 */
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useMenuSubmenu, menuHoverAllowed } from './use-menu-submenu';
import { MenuRow, menuIconColumns, renderMenuDecoration } from './menu-row';
import { SubmenuPanel } from './submenu-panel';
import { usePointerGrace } from './pointer-grace';
import { isBehindModal } from './use-modal-layer';
import { observeComposition } from './keyboard-composition';
import { focusWithoutRing } from './focus';
import { MenuSurface } from './menu-surface';
import css from './menu.module.css';

/** 可选中的行（可以带一个嵌套子菜单）。 */
export interface MenuItem {
  id: string;
  label: ReactNode;
  disabled?: boolean;
  /** 命令归属方提供的有效绑定；未绑定的动作省略此项。 */
  shortcut?: { keys: readonly string[]; aria?: string | undefined };
  /** 前置图标（figma .Menu_cell gap 8）。 */
  icon?: ReactNode;
  /** 危险行：错误色文字/图标与危险色悬停填充。 */
  danger?: boolean;
  /** 悬停、聚焦、点击或 ArrowRight 打开的子选项；位置随可用空间变化。 */
  submenu?: readonly MenuEntry[];
}

/** 条目分组之间的细线（不可选中）。 */
export interface MenuSeparator {
  type: 'separator';
  id: string;
}

/** 一组条目上方的非交互标题行。 */
export interface MenuLabel {
  type: 'label';
  id: string;
  text: string;
}

/** 主菜单的一个条目：行、分隔线或标题标签。 */
export type MenuEntry = MenuItem | MenuSeparator | MenuLabel;

/** 由组件渲染的单个菜单行的 props。 */
export interface MenuItemButtonProps {
  /** 可见的行文案。 */
  children: ReactNode;
  /** 命令归属方提供的有效绑定；未绑定的动作省略此项。 */
  shortcut?: MenuItem['shortcut'];
  /** 前置图标（figma .Menu_cell gap 8）。 */
  icon?: ReactNode;
  /** 这一行是否标识当前显示的页面或视图。 */
  current?: boolean;
  /** 这一行是否不可激活。 */
  disabled?: boolean;
  /**
   * 禁用行为什么不能激活。带原因时该行仍可悬停、可聚焦，用 tooltip 显示原因，
   * 并把它作为该行的 description；可用的行会忽略它。
   */
  disabledReason?: string | undefined;
  /** 危险行：错误色文字/图标与危险色悬停填充。 */
  danger?: boolean;
  /**
   * 开始新分组：这一行上方画一条细线，与 `{ type: 'separator' }` 数据条目画的线相同。
   * 它随行一起出现和消失，因此什么都不渲染的行不会留下孤线；紧挨在它之前的数据分隔线
   * 不会再画第二条线，列表第一行则不画线。
   */
  separatorBefore?: boolean;
  /** 行激活（点击、Enter，或在聚焦行上按 Tab）。 */
  onSelect: () => void;
}

/**
 * 用组件内容填充菜单行，标记与样式和数据行一致，可直接加入 {@link Menu} 的键盘漫游。
 *
 * 关闭菜单仍由持有方决定。
 */
export function MenuItemButton({ onSelect, ...props }: MenuItemButtonProps) {
  return <MenuRow {...props} decorativeIcon={false} onClick={onSelect} />;
}

/** {@link Menu} 的 props。 */
export interface MenuProps {
  open: boolean;
  /** 指针定位的浮层：光标留白、分组图标对齐与右键手势。 */
  contextual?: boolean;
  /** 识别不受外部关闭约束的外部触发器；省略时没有外部节点享有豁免。 */
  isExternalTrigger?: (node: Node) => boolean;
  /** 解析原始控件，用于焦点恢复与 inert/hidden 关闭。 */
  returnFocus?: (() => HTMLElement | null) | undefined;
  /** 在短暂淡出期间保留已关闭的右键浮层。 */
  exiting?: 'dismiss' | 'replace' | undefined;
  autoFocus?: boolean;
  anchor: ReactNode;
  items?: readonly MenuEntry[];
  /** 已本地化的返回动作；省略时用调用方的父行文案加一个返回箭头。 */
  submenuBackLabel?: string | undefined;
  children?: ReactNode;
  footer?: readonly MenuEntry[];
  selectedId?: string | undefined;
  selectedIds?: readonly string[] | undefined;
  onSelect?: (id: string) => void;
  onClose: () => void;
  align?: 'start' | 'end';
  side?: 'bottom' | 'top' | 'right';
  portal?: boolean;
  closeOnPointerLeave?: boolean;
  dense?: boolean;
  compact?: boolean;
  selection?: 'check' | 'fill';
  anchorRef?: RefObject<HTMLElement | null> | undefined;
  /** 本次打开时捕获的客户端坐标；Safari 的偏移只应用一次。 */
  anchorPoint?: { readonly x: number; readonly y: number } | undefined;
  minWidthFromAnchor?: boolean;
  className?: string | undefined;
  listClassName?: string | undefined;
}

/**
 * 锚定在触发器上的下拉菜单。
 *
 * 打开期间 Tab 与方向键在菜单内循环，Escape 关闭并把焦点还给触发器；
 * 两侧都放不下时，子菜单切换为单面板布局。
 */
export function Menu({
  open,
  anchor,
  items = [],
  children,
  submenuBackLabel,
  selectedId,
  selectedIds,
  onSelect,
  onClose,
  align = 'start',
  side = 'bottom',
  portal = false,
  closeOnPointerLeave = false,
  dense = false,
  compact = false,
  autoFocus = false,
  selection = 'check',
  anchorRef,
  anchorPoint,
  minWidthFromAnchor = false,
  footer,
  className,
  listClassName,
  contextual = false,
  exiting,
  returnFocus,
  isExternalTrigger,
}: MenuProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const pointX = anchorPoint?.x;
  const pointY = anchorPoint?.y;
  const point = useMemo(() => {
    if (pointX === undefined || pointY === undefined) return undefined;
    // WebKit 从视觉原点报告客户端坐标，而 fixed 定位用的是布局原点。
    // 此处捕获的点不能随后续平移而移动。
    const visualOrigin =
      open &&
      typeof window.CSS !== 'undefined' &&
      window.CSS.supports('-webkit-backdrop-filter', 'none');
    const viewport = visualOrigin ? window.visualViewport : undefined;
    return {
      x: pointX + (viewport?.offsetLeft ?? 0),
      y: pointY + (viewport?.offsetTop ?? 0),
    };
  }, [open, pointX, pointY]);
  useLayoutEffect(() => {
    const trigger = returnFocus?.();
    if (!open || !contextual || trigger == null) return;
    const previous = trigger.getAttribute('aria-controls');
    trigger.setAttribute('aria-controls', [previous, menuId].filter(Boolean).join(' '));
    return () => {
      if (previous === null) trigger.removeAttribute('aria-controls');
      else trigger.setAttribute('aria-controls', previous);
    };
  }, [open, contextual, returnFocus, menuId]);
  /** 方向键漫游上一次聚焦的下标；焦点离开列表行后的续走起点。 */
  const walkIndex = useRef<number | null>(null);
  /**
   * 菜单打开时持有键盘的那个控件——也就是它自己的触发器。
   * 锚点包着多个控件时（分裂按钮），靠位置无法指认它。
   */
  const triggerRef = useRef<HTMLElement | null>(null);
  const selectingWithTab = useRef(false);

  /**
   * 把键盘还给打开菜单的触发器——锚点从未获得过焦点时，还给锚点的第一个按钮。
   * 否则焦点留在被移除的行上会落到页面 body，下一次 Tab 会从页面顶部重新开始。
   * @param navigation - 明确的键盘遍历是否保留它的焦点指示。
   */
  const refocusAnchor = (navigation = false): void => {
    const remembered = triggerRef.current;
    const trigger =
      returnFocus?.() ?? (remembered?.isConnected ? remembered : anchorRef?.current) ?? null;
    const target =
      trigger !== null && document.contains(trigger) && !(trigger as HTMLButtonElement).disabled
        ? trigger
        : rootRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    if (target == null) return;
    if (navigation) target.focus();
    else focusWithoutRing(target);
  };

  /**
   * 选中后的焦点归还，用于行随列表一起卸载的路径。
   * 持有方让菜单保持打开的选择不做处理；持有方自己移动过焦点也不做处理
   * （例如展示文件卡片把焦点交给它的预览按钮）：只有仍留在关闭中列表上
   * （或它移除后产生的 body 上）的键盘才会被送回触发器。
   */
  const refocusAfterSelection = (): void => {
    const navigation = selectingWithTab.current;
    queueMicrotask(() => {
      if (openRef.current && exitingRef.current === undefined) return;
      const active = document.activeElement;
      if (
        active === null ||
        active === document.body ||
        listRef.current?.contains(active) === true ||
        submenu.contains(active)
      )
        refocusAnchor(navigation);
    });
  };
  const exitingRef = useRef(exiting);
  const openRef = useRef(open);
  const submenu = useMenuSubmenu({
    open: open && exiting === undefined,
    items,
    footer,
    listRef,
    refocusAnchor,
  });
  const submenuEvents =
    useRef<Pick<typeof submenu, 'contains' | 'activeList' | 'returnToParent'>>(submenu);
  const close = useRef(onClose);
  // 文档监听只在提交后挂载，事件也在提交后触发；在布局阶段刷新这些「最新值」
  // 引用既能保证读到本次渲染的闭包，又不必在渲染期间写 ref。
  useLayoutEffect(() => {
    exitingRef.current = exiting;
    openRef.current = open;
    submenuEvents.current = submenu;
    close.current = onClose;
  });
  const anchorName = `--dsh-menu-trigger-${menuId.replaceAll(':', '')}`;
  const [externalAnchor, setExternalAnchor] = useState<HTMLElement | null>(null);
  const positioned = !portal || anchorRef === undefined || externalAnchor !== null;
  // 外部 ref 可能在本组件之后才挂上，也可能在不改变 ref 身份的情况下替换元素。
  // 等所有 ref 提交后再发布锚点。
  useEffect(() => {
    if (!open || !portal || anchorRef === undefined) {
      setExternalAnchor(null);
      return;
    }
    const element = anchorRef.current;
    setExternalAnchor(element);
    if (element === null) return;
    const previous = element.style.getPropertyValue('anchor-name');
    const priority = element.style.getPropertyPriority('anchor-name');
    element.style.setProperty('anchor-name', anchorName);
    return () => {
      element.style.setProperty('anchor-name', previous, priority);
    };
  });
  useEffect(() => {
    if (!open || !portal || exiting !== undefined) return;
    const currentAnchor = (): HTMLElement | null =>
      returnFocus?.() ?? (anchorRef === undefined ? rootRef.current : anchorRef.current);
    const element = currentAnchor();
    if (element === null) return;
    let dismissed = false;
    const check = (): void => {
      const current = currentAnchor();
      if (
        dismissed ||
        (current !== null && current.isConnected && current.closest('[inert], [hidden]') === null)
      )
        return;
      dismissed = true;
      close.current();
    };
    const observer = new MutationObserver(check);
    observer.observe(element.ownerDocument.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['inert', 'hidden'],
    });
    check();
    return () => {
      observer.disconnect();
    };
  }, [open, portal, exiting, anchorRef, externalAnchor, returnFocus]);
  const { arm: armClose, cancel: cancelClose } = usePointerGrace(onClose);

  // 打开时记住键盘在哪，关闭时才能还给那个控件——锚点包着多个控件
  // （分裂按钮）时无法靠位置问到它。声明在 autoFocus 的 effect 之前，
  // 这样捕获到的是触发器，而不是 autoFocus 即将聚焦的行。
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    triggerRef.current =
      active instanceof HTMLElement &&
      active !== document.body &&
      (anchorRef !== undefined ||
        anchorPoint !== undefined ||
        rootRef.current?.contains(active) === true)
        ? active
        : null;
  }, [open]);

  useEffect(() => {
    if (
      !open ||
      !positioned ||
      exiting !== undefined ||
      !autoFocus ||
      listRef.current?.contains(document.activeElement) ||
      submenu.contains(document.activeElement)
    )
      return;
    const first = listRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)');
    walkIndex.current = first === undefined || first === null ? null : 0;
    if (first != null) focusWithoutRing(first);
  }, [open, autoFocus, items.length, footer?.length, positioned, exiting]);

  useEffect(() => {
    if (!open || exiting !== undefined) {
      walkIndex.current = null;
      return;
    }
    const composition = observeComposition(document);
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof Node) || (contextual && e.button === 2)) return;
      // portal 出来的列表在锚点子树之外，两处都要检查。
      if (
        rootRef.current?.contains(e.target) === true ||
        anchorRef?.current?.contains(e.target) === true
      )
        return;
      if (isExternalTrigger?.(e.target) === true) return;
      if (listRef.current?.contains(e.target) === true || submenuEvents.current.contains(e.target))
        return;
      onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        composition.guards(e) ||
        isBehindModal(triggerRef.current ?? rootRef.current) ||
        e.defaultPrevented ||
        e.ctrlKey ||
        e.altKey ||
        e.metaKey
      )
        return;
      // 键盘在哪，只算一次：菜单按住了一行，或者它就落在锚点区域上，都算菜单拥有键盘。
      const focused = document.activeElement;
      const insideList =
        listRef.current?.contains(focused) === true || submenuEvents.current.contains(focused);
      const anchored =
        focused === returnFocus?.() ||
        anchorRef?.current?.contains(focused) === true ||
        rootRef.current?.contains(focused) === true ||
        insideList;
      if (e.key === 'Escape' && !e.shiftKey) {
        e.preventDefault();
        if (e.repeat) return;
        if (submenuEvents.current.returnToParent()) return;
        // 菜单曾拥有键盘时，关闭要把键盘还回去；对 autoFocus 菜单，本原语一直这么做，
        // 即使它曾拥有键盘又失去（一行在它下面卸载了）。
        onClose();
        if (anchored || autoFocus) refocusAnchor();
      }
      if (e.key === 'ArrowLeft' && anchored && submenuEvents.current.returnToParent()) {
        e.preventDefault();
        return;
      }
      if (
        e.key === 'ArrowRight' &&
        insideList &&
        focused instanceof HTMLButtonElement &&
        focused.getAttribute('aria-haspopup') === 'menu'
      ) {
        e.preventDefault();
        focused.click();
        return;
      }
      // Tab 像 Enter 一样结算，Shift+Tab 像 Escape 一样离开，因此菜单的按键
      // 与输入框里的含义一致。只有已经在触发器上或列表内的键盘会被拦截：
      // 菜单打开时页面上其它位置的 Tab 仍走浏览器遍历。
      if (e.key === 'Tab') {
        const list = submenuEvents.current.activeList(focused);
        if (list === null || !anchored) return;
        if (e.shiftKey) {
          e.preventDefault();
          onClose();
          refocusAnchor(true);
          return;
        }
        // Tab 结算它所在的那一行；从菜单区域的其它位置进入列表。
        // 聚焦的不是行（错误条里的重试按钮）或列表没有可用行时，
        // 保留浏览器遍历而不是吞掉按键。
        if (insideList) {
          if (focused instanceof Element && focused.getAttribute('role') === 'menuitem') {
            e.preventDefault();
            if (focused.getAttribute('aria-disabled') === 'true') {
              onClose();
              refocusAnchor(true);
              return;
            }
            selectingWithTab.current = true;
            try {
              (focused as HTMLElement).click();
            } finally {
              selectingWithTab.current = false;
            }
          }
          return;
        }
        const row = list.querySelector<HTMLButtonElement>('button:not(:disabled)');
        if (row === null) return;
        e.preventDefault();
        row.focus();
        walkIndex.current = 0;
        return;
      }
      // 无论菜单是否在打开时聚焦了第一个条目，方向键都在列表里漫游，
      // 所以 `autoFocus` 只决定入场行为。键盘仍在锚点上时从来的那一端进入——
      // 除非已经漫游过，此时从上次位置继续。续走依据是上一次把焦点放到哪，
      // 而不是 `document.activeElement`：拒绝接受焦点的行（隐藏的 portal 框架、
      // 已脱离的节点）否则会在每次按键时从近端重新进入，漫游会在两行之间来回跳。
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      const list = submenuEvents.current.activeList(focused);
      if (list === null || !anchored) return;
      const buttons = Array.from(list.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
      if (buttons.length === 0) return;
      const index = buttons.indexOf(focused as HTMLButtonElement);
      const from = index >= 0 ? index : walkIndex.current;
      const next =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? buttons.length - 1
            : from === null
              ? e.key === 'ArrowDown'
                ? 0
                : buttons.length - 1
              : (from + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
      e.preventDefault();
      walkIndex.current = next;
      buttons[next]?.focus();
    };
    // 落在跨域 iframe（沙箱化的 HTML 预览）里的 pointerdown 永远到不了本文档；
    // 它引起的焦点移动表现为窗口 blur。只有这种情况才关闭：切换应用或标签页时
    // 文档焦点原地不动，activeElement 不是 iframe。
    const onWindowBlur = () => {
      if (document.activeElement instanceof HTMLIFrameElement) onClose();
    };
    document.addEventListener('pointerdown', onPointerDown);
    const onEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onKeyDown(event);
    };
    const onOtherKey = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') onKeyDown(event);
    };
    document.addEventListener('keydown', onOtherKey);
    document.addEventListener('keydown', onEscape, true);
    window.addEventListener('blur', onWindowBlur);
    return () => {
      composition.dispose();
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onOtherKey);
      document.removeEventListener('keydown', onEscape, true);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [open, onClose, autoFocus, contextual, exiting, anchorRef, returnFocus, isExternalTrigger]);

  useLayoutEffect(() => {
    if (exiting === 'dismiss' && listRef.current?.contains(document.activeElement)) refocusAnchor();
  }, [exiting]);

  // 由选中、Escape、外部点击引起的关闭会跑在一次排队的宽限关闭前面；
  // 若仍处于待触发状态，它会在宽限窗口内关闭刚重新打开的列表。
  // 单独一个 effect，而不是上面的监听 effect：后者每次 `onClose` 身份变化都会重跑，
  // 会在中途取消宽限期。
  useEffect(() => {
    if (!open) cancelClose();
  }, [open, cancelClose]);

  const itemColumns = menuIconColumns(items, contextual);
  const footerColumns = menuIconColumns(footer ?? [], contextual);
  const renderEntry = (entry: MenuEntry, columns: ReadonlySet<MenuEntry>) => {
    if ('type' in entry) return renderMenuDecoration(entry);
    const hasSub = entry.submenu !== undefined && entry.submenu.length > 0;
    return (
      <MenuRow
        key={entry.id}
        icon={entry.icon}
        reserveIcon={columns.has(entry)}
        disabled={entry.disabled}
        danger={entry.danger}
        shortcut={entry.shortcut}
        selected={entry.id === selectedId || selectedIds?.includes(entry.id) === true}
        selection={selection}
        aria-haspopup={hasSub ? 'menu' : undefined}
        aria-expanded={hasSub ? submenu.entry?.id === entry.id && !submenu.hidden : undefined}
        wrapperProps={
          hasSub
            ? {
                onPointerEnter: (event) => {
                  if (!menuHoverAllowed(event) || entry.disabled) return;
                  const trigger = event.currentTarget.querySelector<HTMLButtonElement>('button');
                  if (trigger !== null) submenu.openChild(entry.id, trigger);
                },
                onPointerLeave: (event) => {
                  if (menuHoverAllowed(event)) submenu.leave();
                },
              }
            : undefined
        }
        onFocus={
          hasSub
            ? (event) => {
                submenu.focusParent(entry.id, event.currentTarget);
              }
            : undefined
        }
        onClick={(event) => {
          if (hasSub) submenu.openChild(entry.id, event.currentTarget, true);
          else onSelect?.(entry.id);
        }}
      >
        {entry.label}
      </MenuRow>
    );
  };

  const list = open && positioned && (
    <MenuSurface
      compact={compact}
      id={contextual ? menuId : undefined}
      ref={listRef}
      className={clsx(
        css.list,
        listClassName,
        dense && css.denseList,
        compact && css.compactList,
        css.scrollable,
        submenu.page && css.parentPage,
        portal && css.portal,
        side === 'top' && !portal && css.sideTop,
        align === 'end' && !portal && css.alignEnd,
      )}
      style={portal ? { positionAnchor: anchorName } : undefined}
      data-anchor-side={portal ? side : undefined}
      data-anchor-align={portal ? align : undefined}
      data-match-anchor-width={portal && minWidthFromAnchor ? '' : undefined}
      role={exiting === undefined && !submenu.page ? 'menu' : undefined}
      aria-hidden={exiting === undefined && !submenu.page ? undefined : true}
      data-context-menu={contextual ? '' : undefined}
      phase={contextual ? (exiting ?? 'enter') : undefined}
      // React portal 会沿 React 树冒泡合成事件：不在这里截断，条目的点击会在
      // onSelect 之后再次触发锚点行自己的 onClick（打开/切换）。同一条冒泡也是
      // 每一行激发的落点——数据行与组件行都一样——因此选中后的焦点归还在
      // 这里、在该行自己的处理器跑完之后统一决定；子菜单父行只是打开了卡片。
      onClick={(e) => {
        e.stopPropagation();
        const row =
          e.target instanceof Element ? e.target.closest('button[role="menuitem"]') : null;
        if (row !== null && row.getAttribute('aria-haspopup') !== 'menu') refocusAfterSelection();
      }}
      onContextMenu={
        contextual
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }
          : undefined
      }
      onPointerOver={(event) => {
        if (menuHoverAllowed(event)) submenu.collapseFrom(event);
      }}
      onFocus={submenu.collapseFrom}
    >
      {/* 子卡片锚定到这个不滚动的盒子，它与卡片本身重合。 */}
      {submenu.entry !== undefined && (
        <span
          aria-hidden="true"
          className={css.submenuAnchor}
          style={{ anchorName: submenu.parentAnchor }}
        />
      )}
      <div className={css.viewport} role="presentation">
        {items.map((entry) => renderEntry(entry, itemColumns))}
        {children}
      </div>
      {footer !== undefined && footer.length > 0 && (
        <div className={css.footer} role="presentation">
          {footer.map((entry) => renderEntry(entry, footerColumns))}
        </div>
      )}
    </MenuSurface>
  );

  const rootStyle: CSSProperties = {
    anchorName: anchorRef === undefined ? anchorName : undefined,
    ...(point === undefined
      ? {}
      : { position: 'fixed', left: point.x, top: point.y, width: 0, height: 0 }),
  };

  // 指针离开的关闭判断盯的是外层容器而不是列表：React 的 enter/leave 沿 React 树遍历，
  // 因此触发器与 portal 出去的列表在这里是同一个区域。指回触发器、或穿过它们之间
  // 4px 的间隙，都不会被算作离开。
  return (
    <span
      ref={rootRef}
      className={clsx(css.root, className)}
      style={rootStyle}
      onPointerEnter={closeOnPointerLeave ? cancelClose : undefined}
      onPointerLeave={
        closeOnPointerLeave
          ? (event) => {
              if (open && menuHoverAllowed(event)) armClose();
            }
          : undefined
      }
    >
      {anchor}
      {portal ? list !== false && createPortal(list, document.body) : list}
      {open && exiting === undefined && submenu.entry !== undefined && (
        <SubmenuPanel
          key={submenu.entry.id}
          entry={submenu.entry}
          submenu={submenu}
          compact={compact}
          dense={dense}
          contextual={contextual}
          backLabel={submenuBackLabel ?? submenu.entry.label}
          onSelect={onSelect}
          onClose={onClose}
          afterSelection={refocusAfterSelection}
        />
      )}
    </span>
  );
}
