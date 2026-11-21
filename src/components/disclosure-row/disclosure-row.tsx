'use client';

/** 可展开的摘要行：左侧是图标或折叠箭头，展开后显示详细内容。 */
import { memo, useId } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutline } from '../../icons';
import { TextShimmer } from '../text-shimmer';
import css from './disclosure-row.module.css';

export interface DisclosureRowProps {
  /** 收起状态下的前置图标，通常是状态或工具图标。 */
  icon: ReactNode;
  /** 摘要标题，同时作为展开按钮的无障碍名称。 */
  title: string;
  /** 是否展开；受控。 */
  open: boolean;
  /** 是否允许展开；为 `false` 时折叠交互全部禁用。 */
  expandable: boolean;
  /** 切换展开状态。 */
  onToggle: () => void;
  /** 标题是否播放进行中的扫光动画。 */
  running?: boolean;
  /** 是否允许点击整行切换，默认只响应左侧箭头按钮。 */
  expandOnRowClick?: boolean;
  /** 收起时悬停是否用箭头替换图标。 */
  previewChevron?: boolean;
  /** 展开时是否仍显示 `collapsedContent`。 */
  keepContentWhenOpen?: boolean;
  /** 标题旁始终可见的摘要内容。 */
  collapsedContent?: ReactNode;
  /** 行尾的附加操作区。 */
  headerAccessory?: ReactNode;
  /** 展开后的内容。 */
  children?: ReactNode;
  /** 追加在外层容器上的类名。 */
  className?: string;
  /** 追加在标题行上的类名。 */
  rowClassName?: string;
  /** 追加在内容容器上的类名。 */
  contentClassName?: string;
  /** 追加在内容布局层上的类名。 */
  contentLayoutClassName?: string;
  /** 追加在前置图标容器上的类名。 */
  leadingClassName?: string;
  /** 追加在折叠箭头上的类名。 */
  chevronClassName?: string;
  /** 追加在标题上的类名。 */
  titleClassName?: string;
}

/**
 * 可展开的摘要行。
 *
 * 展开与收起由 `open` 控制，内容区域用 `grid-template-rows` 做高度过渡；
 * 展开按钮通过 `aria-expanded` 与 `aria-controls` 关联到内容区域。
 */
export const DisclosureRow = memo(function DisclosureRow({
  icon,
  title,
  open,
  expandable,
  onToggle,
  running = false,
  expandOnRowClick = false,
  previewChevron = false,
  keepContentWhenOpen = false,
  collapsedContent,
  headerAccessory,
  children,
  className,
  rowClassName,
  contentClassName,
  contentLayoutClassName,
  leadingClassName,
  chevronClassName,
  titleClassName,
}: DisclosureRowProps) {
  const contentId = useId();
  const rowExpands = expandable && expandOnRowClick;

  const toggle = () => {
    if (expandable) onToggle();
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!rowExpands) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggle();
    }
  };

  const leadingVisual = (
    <span className={clsx(css.leadingVisual, leadingClassName)}>
      {open ? (
        <IconChevronDownOutline className={clsx(css.chevronOpen, chevronClassName)} />
      ) : previewChevron ? (
        <>
          <span className={css.iconIdle}>{icon}</span>
          <IconChevronDownOutline className={clsx(css.chevronHover, chevronClassName)} />
        </>
      ) : (
        icon
      )}
    </span>
  );

  return (
    <div className={clsx(css.root, className)} data-open={open ? '' : undefined}>
      <div className={css.header}>
        <div
          className={clsx(css.row, rowExpands && css.rowClickable, rowClassName)}
          role={rowExpands ? 'button' : undefined}
          tabIndex={rowExpands ? 0 : undefined}
          aria-expanded={rowExpands ? open : undefined}
          aria-controls={rowExpands ? contentId : undefined}
          onClick={rowExpands ? toggle : undefined}
          onKeyDown={handleRowKeyDown}
        >
          {expandable && !rowExpands ? (
            <button
              type="button"
              className={css.leading}
              aria-label={title}
              aria-expanded={open}
              aria-controls={contentId}
              onClick={(event) => {
                event.stopPropagation();
                toggle();
              }}
            >
              {leadingVisual}
            </button>
          ) : (
            <span className={css.leading}>{leadingVisual}</span>
          )}

          <TextShimmer active={running} className={css.shimmer} contentClassName={css.summary}>
            <span className={clsx(css.title, titleClassName)}>{title}</span>
            {collapsedContent !== undefined && (keepContentWhenOpen || !open) && (
              <span className={css.collapsed}>{collapsedContent}</span>
            )}
          </TextShimmer>
        </div>

        {headerAccessory !== undefined && <div className={css.accessory}>{headerAccessory}</div>}
      </div>

      <div className={css.collapsible} data-open={open ? '' : undefined} aria-hidden={!open}>
        <div className={css.collapsibleInner}>
          <div id={contentId} className={clsx(css.content, contentClassName)}>
            <div className={clsx(css.contentLayout, contentLayoutClassName)}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
});
