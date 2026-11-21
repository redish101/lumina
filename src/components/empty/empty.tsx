'use client';

import { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './empty.module.css';

/** 空状态尺寸档位。 */
export type EmptySize = 'sm' | 'md';

export type EmptyProps = {
  /** 顶部图标，尺寸由 40px（sm 为 32px）的容器约束，无需自己写死。 */
  icon?: ReactNode;
  /** 主标题，说明当前没有什么。 */
  title?: ReactNode;
  /** 补充说明，引导下一步操作。 */
  description?: ReactNode;
  /** 行动区，通常放一个主按钮。 */
  action?: ReactNode;
  /** 尺寸档位，默认 `md`。 */
  size?: EmptySize;
  /** 追加在最外层容器上的类名。 */
  className?: string;
};

/**
 * 空状态占位：图标、标题、说明与行动区居中对齐。
 *
 * 图标容器固定为 40px（`sm` 为 32px）并只约束直接子元素，
 * 因此任意图标组件都会自动铺满，不需要调用方再传尺寸。
 */
export const Empty = forwardRef<HTMLDivElement, EmptyProps>(function Empty(
  { icon, title, description, action, size = 'md', className },
  ref,
) {
  return (
    <div ref={ref} className={clsx(css.empty, className)} data-size={size}>
      {icon !== undefined && (
        <div aria-hidden="true" className={css.icon}>
          {icon}
        </div>
      )}
      {title !== undefined && <div className={css.title}>{title}</div>}
      {description !== undefined && <div className={css.description}>{description}</div>}
      {action !== undefined && <div className={css.action}>{action}</div>}
    </div>
  );
});
