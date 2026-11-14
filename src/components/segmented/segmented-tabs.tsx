'use client';

import type { KeyboardEvent, ReactNode } from 'react';
import clsx from 'clsx';
import { Pill } from '../pill';
import css from './segmented-tabs.module.css';

/** 一个分段标签，把本地化文案关联到使用方自己的面板。 */
export interface SegmentedTab<Value extends string = string> {
  /** 选中后交给使用方的值。 */
  value: Value;
  /** 标签内容，可以内嵌 Pill 徽标等节点。 */
  label: ReactNode;
  /** 标签自身的 DOM id。 */
  id: string;
  /** 该标签控制的面板 DOM id。 */
  panelId: string;
}

export type SegmentedTabsProps<Value extends string = string> = {
  /** 非空且按展示顺序排列的标签，值互不相同、DOM id 唯一。 */
  items: readonly [SegmentedTab<Value>, ...SegmentedTab<Value>[]];
  /** 当前选中的值，必须属于 items。 */
  value: Value;
  /** 点击、左右方向键或 Home/End 请求切换时触发；键盘切换会同时移动焦点。 */
  onChange: (value: Value) => void;
  /** tablist 的本地化可访问名称。 */
  label: string;
  /** 追加在外层容器上的类名，用于布局定位；面板仍由使用方渲染。 */
  className?: string | undefined;
  /**
   * `sm` 为 30px 标签 + 2px 内边距（总高 34px）；默认 `md` 为 34px 标签 + 4px
   * 内边距（总高 42px）。
   */
  size?: 'sm' | 'md' | undefined;
};

/**
 * 等宽、受控的分段标签页，带一块滑动的选中指示器。
 *
 * 标签用 Pill 渲染：Pill 收到 `onClick` 时输出按钮，因此这里始终是按钮，
 * 并保留 tablist 的 roving tabindex 语义。组件只渲染标签栏，不渲染面板。
 */
export function SegmentedTabs<Value extends string>({
  items,
  value,
  onChange,
  label,
  className,
  size = 'md',
}: SegmentedTabsProps<Value>): ReactNode {
  const selectedIndex = items.findIndex((item) => item.value === value);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case 'ArrowLeft':
        next = (index + items.length - 1) % items.length;
        break;
      case 'ArrowRight':
        next = (index + 1) % items.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const tablist = event.currentTarget.parentElement;
    const nextItem = items[next];
    if (tablist === null || nextItem === undefined) return;
    tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]').item(next).focus();
    onChange(nextItem.value);
  };

  return (
    <div
      role="tablist"
      data-size={size}
      aria-label={label}
      className={clsx(css.tabs, className)}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      <span
        className={css.indicator}
        aria-hidden="true"
        style={{
          width: `calc((100% - 2 * var(--segmented-tabs-inset)) / ${items.length})`,
          transform: `translateX(${selectedIndex * 100}%)`,
        }}
      />
      {items.map((item, index) => (
        <Pill
          key={item.value}
          id={item.id}
          role="tab"
          className={css.tab}
          aria-selected={value === item.value}
          aria-controls={item.panelId}
          tabIndex={value === item.value ? 0 : -1}
          onClick={() => {
            onChange(item.value);
          }}
          onKeyDown={(event) => {
            onKeyDown(event, index);
          }}
        >
          {item.label}
        </Pill>
      ))}
    </div>
  );
}
