'use client';

import { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './card.module.css';

/** 卡片内边距档位，对应 0 / 12 / 16 / 24px。 */
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export type CardProps = {
  /** 标题，渲染在卡片头部。 */
  title?: ReactNode;
  /** 标题下方的补充说明。 */
  description?: ReactNode;
  /** 头部右侧的操作区，例如按钮或菜单。 */
  actions?: ReactNode;
  /** 底部信息条，常用于更新时间、计数等次要信息。 */
  footer?: ReactNode;
  /** 内边距档位，默认 `md`。 */
  padding?: CardPadding;
  /** 悬停抬升并显示可点击指针；是否可点击由使用方决定。 */
  interactive?: boolean;
  /** 追加在最外层容器上的类名。 */
  className?: string;
  /** 卡片主体内容。 */
  children: ReactNode;
};

/**
 * 通用卡片容器：可选的头部（标题、描述、操作）与底部信息条。
 *
 * `interactive` 只负责悬停抬升与指针样式，不注入 `tabIndex` 或点击行为，
 * 让使用方自行决定整卡是否可交互。
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { title, description, actions, footer, padding = 'md', interactive = false, className, children },
  ref,
) {
  const hasHeading = title !== undefined || description !== undefined;
  const hasHeader = hasHeading || actions !== undefined;

  return (
    <div
      ref={ref}
      className={clsx(css.card, className)}
      data-padding={padding}
      data-interactive={interactive || undefined}
    >
      {hasHeader && (
        <div className={css.header}>
          {hasHeading && (
            <div className={css.heading}>
              {title !== undefined && <div className={css.title}>{title}</div>}
              {description !== undefined && <div className={css.description}>{description}</div>}
            </div>
          )}
          {actions !== undefined && <div className={css.actions}>{actions}</div>}
        </div>
      )}
      <div className={css.body}>{children}</div>
      {footer !== undefined && <div className={css.footer}>{footer}</div>}
    </div>
  );
});
