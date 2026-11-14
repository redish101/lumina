'use client';

/** 菜单表面材质，以及让 Chromium 能对透明窗口做背景模糊的 macOS 衬底。 */
import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import css from './menu-surface.module.css';

/** 右键菜单过渡时长（毫秒），与生命周期持有方共享。 */
export const MENU_TRANSITION_MS = Object.freeze({
  enter: 40,
  dismiss: 80,
  replace: 10,
  prepare: 20,
});

/** 菜单容器保留原生 div props 与 ref。 */
export interface MenuSurfaceProps extends ComponentPropsWithoutRef<'div'> {
  /** 匹配共享紧凑菜单更小的外圆角。 */
  compact?: boolean;
  /** 淡出直接内容、材质与原生衬底，但不隔离材质的 backdrop。 */
  phase?: 'enter' | 'dismiss' | 'replace' | undefined;
}

/** 菜单卡片的锚点与过渡时长变量。 */
type MenuAnchorStyle = CSSProperties & Record<`--dsh-menu-${string}`, string>;

/**
 * 菜单卡片表面；在 macOS 上额外铺一层随菜单定位的衬底。
 *
 * CSS 锚点让衬底在移动、缩放与嵌套菜单展开时始终对齐。
 */
export const MenuSurface = forwardRef<HTMLDivElement, MenuSurfaceProps>(function MenuSurface(
  { compact = false, phase, className, style, children, ...props },
  ref,
) {
  const id = useId();
  const backingRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // 嵌套的 React portal 可能先插入衬底再插入它的锚点，
    // 而 CSS 锚点定位要求锚点出现在被定位元素之前。
    const backing = backingRef.current;
    if (backing === null) return;
    document.body.appendChild(backing);
  }, []);
  const anchorStyle: MenuAnchorStyle = {
    '--dsh-menu-anchor': `--dsh-menu-${id.replaceAll(':', '')}`,
    '--dsh-menu-enter': `${MENU_TRANSITION_MS.enter}ms`,
    '--dsh-menu-dismiss': `${MENU_TRANSITION_MS.dismiss}ms`,
    '--dsh-menu-replace': `${MENU_TRANSITION_MS.replace}ms`,
  };
  return (
    <>
      <div
        {...props}
        ref={ref}
        data-menu-material="translucent"
        data-menu-phase={phase}
        className={clsx(css.surface, compact && css.compact, className)}
        style={{ ...style, ...anchorStyle }}
      >
        <div aria-hidden="true" className={css.material} />
        {children}
      </div>
      {createPortal(
        <div
          ref={backingRef}
          aria-hidden="true"
          data-menu-backing=""
          data-menu-phase={phase}
          className={clsx(css.backing, compact && css.compact)}
          style={{ ...anchorStyle, visibility: style?.visibility }}
        />,
        document.body,
      )}
    </>
  );
});
