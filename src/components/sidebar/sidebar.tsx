'use client';

import { forwardRef, useId, useState, type HTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import { IconChevronLeftOutline, IconChevronRightOutline } from '../../icons';
import css from './sidebar.module.css';

export interface SidebarItem {
  /** 条目唯一标识，用于选中态与 `onSelect` 回调。 */
  id: string;
  /** 条目文案。 */
  label: ReactNode;
  /** 可选的前置图标。 */
  icon?: ReactNode;
  /** 可选的徽标，数字或自定义节点。 */
  badge?: ReactNode | number;
  /** 是否禁用该条目。 */
  disabled?: boolean;
  /** 传入时渲染为 `<a>`，否则渲染为 `<button type="button">`。 */
  href?: string;
}

export interface SidebarSection {
  /** 分组标题，省略时不渲染标题行。 */
  title?: ReactNode;
  /** 分组内的条目。 */
  items: SidebarItem[];
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** 顶层条目列表。 */
  items: SidebarItem[];
  /** 可选的分组列表，渲染在顶层条目之后。 */
  sections?: SidebarSection[];
  /** 当前选中条目的 id。 */
  activeId?: string;
  /** 选中条目时调用，参数为该条目的 id。 */
  onSelect?: (id: string) => void;
  /** 顶部自定义内容。 */
  header?: ReactNode;
  /** 底部自定义内容。 */
  footer?: ReactNode;
  /** 是否在底部渲染折叠按钮，默认 `false`。 */
  collapsible?: boolean;
  /** 受控折叠状态；传入时以该值为准。 */
  collapsed?: boolean;
  /** 非受控模式下的初始折叠状态，默认 `false`。 */
  defaultCollapsed?: boolean;
  /** 折叠状态变化时调用，便于受控使用。 */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** 展开时的宽度（px），默认 248。 */
  width?: number;
  /** 折叠时的宽度（px），默认 64。 */
  collapsedWidth?: number;
  /** 追加到最外层导航节点的类名。 */
  className?: string;
}

function getLabelText(label: ReactNode): string | undefined {
  if (typeof label === 'string') return label;
  if (typeof label === 'number') return String(label);
  return undefined;
}

/**
 * 数据驱动的侧边导航：支持分组、徽标、链接条目与可折叠宽度，
 * 折叠时只隐藏文案的视觉呈现，仍保留每个条目的可访问名称。
 */
export const Sidebar = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    items,
    sections,
    activeId,
    onSelect,
    header,
    footer,
    collapsible = false,
    collapsed,
    defaultCollapsed = false,
    onCollapsedChange,
    width = 248,
    collapsedWidth = 64,
    className,
    style,
    ...rest
  },
  ref,
) {
  const sectionIdBase = useId();
  const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
  const isCollapsedControlled = collapsed !== undefined;
  const isCollapsed = isCollapsedControlled ? collapsed : internalCollapsed;
  const currentWidth = isCollapsed ? collapsedWidth : width;

  const handleToggleCollapsed = (): void => {
    const nextCollapsed = !isCollapsed;
    if (!isCollapsedControlled) {
      setInternalCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  const renderItem = (item: SidebarItem): ReactNode => {
    const isActive = activeId === item.id;
    // 折叠时文案在视觉上隐藏；字符串/数字标签同时提供 title 与 aria-label 兜底。
    const collapsedLabel = isCollapsed ? getLabelText(item.label) : undefined;
    const itemClassName = clsx(css.item, isActive && css.active, item.disabled && css.disabled);
    const content = (
      <>
        {item.icon !== undefined ? <span className={css.icon}>{item.icon}</span> : null}
        <span className={css.label}>{item.label}</span>
        {item.badge !== undefined && item.badge !== null ? (
          <span className={css.badge}>{item.badge}</span>
        ) : null}
      </>
    );

    return (
      <li key={item.id} className={css.listItem}>
        {item.href ? (
          <a
            href={item.href}
            className={itemClassName}
            aria-current={isActive ? 'page' : undefined}
            aria-disabled={item.disabled || undefined}
            aria-label={collapsedLabel}
            title={collapsedLabel}
            tabIndex={item.disabled ? -1 : undefined}
            onClick={(event) => {
              if (item.disabled) {
                event.preventDefault();
                return;
              }
              onSelect?.(item.id);
            }}
          >
            {content}
          </a>
        ) : (
          <button
            type="button"
            className={itemClassName}
            disabled={item.disabled}
            aria-current={isActive ? 'page' : undefined}
            aria-label={collapsedLabel}
            title={collapsedLabel}
            onClick={() => {
              onSelect?.(item.id);
            }}
          >
            {content}
          </button>
        )}
      </li>
    );
  };

  return (
    <nav
      ref={ref}
      aria-label="侧边导航"
      className={clsx(css.sidebar, className)}
      style={{ ...style, width: currentWidth }}
      data-collapsed={isCollapsed}
      {...rest}
    >
      {header !== undefined ? <div className={css.header}>{header}</div> : null}

      <div className={css.scroll}>
        {items.length > 0 ? <ul className={css.list}>{items.map(renderItem)}</ul> : null}

        {sections?.map((section, index) => {
          const sectionTitleId = `${sectionIdBase}-section-${index}`;
          return (
            <div
              key={index}
              className={css.section}
              role="group"
              aria-labelledby={section.title !== undefined ? sectionTitleId : undefined}
            >
              {section.title !== undefined ? (
                <div id={sectionTitleId} className={css.sectionTitle}>
                  {section.title}
                </div>
              ) : null}
              <ul className={css.list}>{section.items.map(renderItem)}</ul>
            </div>
          );
        })}
      </div>

      {footer !== undefined ? <div className={css.footer}>{footer}</div> : null}

      {collapsible ? (
        <div className={css.collapseRow}>
          <button
            type="button"
            className={css.collapseButton}
            aria-expanded={!isCollapsed}
            aria-label={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
            title={isCollapsed ? '展开侧边栏' : '收起侧边栏'}
            onClick={handleToggleCollapsed}
          >
            {isCollapsed ? (
              <IconChevronRightOutline size={16} />
            ) : (
              <IconChevronLeftOutline size={16} />
            )}
            <span className={css.collapseLabel}>{isCollapsed ? '展开' : '收起'}</span>
          </button>
        </div>
      ) : null}
    </nav>
  );
});

Sidebar.displayName = 'Sidebar';
