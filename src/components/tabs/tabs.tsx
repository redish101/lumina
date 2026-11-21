'use client';

import { forwardRef, useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import clsx from 'clsx';
import css from './tabs.module.css';

/** 一个导航标签的数据。 */
export interface TabItem {
  /** 稳定且唯一的标识，受控值通过它比较。 */
  id: string;
  /** 标签文案，可以是任意节点。 */
  label: ReactNode;
  /** 可选的前置图标，尺寸由调用方决定。 */
  icon?: ReactNode;
  /** 可选的徽标：数字渲染成胶囊，节点原样渲染。 */
  badge?: ReactNode | number;
  /** 禁用后不响应点击，键盘漫游也会跳过它。 */
  disabled?: boolean;
}

/** 标签栏的视觉变体：下划线或胶囊滑动指示器。 */
export type TabsVariant = 'underline' | 'pill';

export type TabsProps = {
  /** 按展示顺序排列的标签；只渲染标签栏，不渲染面板。 */
  items: readonly TabItem[];
  /** 当前选中的标签 id；提供时组件受控。 */
  value?: string;
  /** 非受控模式下的初始选中项，缺省为第一个可用标签。 */
  defaultValue?: string;
  /** 点击或键盘切换时触发，面板由使用方按 id 自行渲染。 */
  onChange?: (id: string) => void;
  /** 视觉变体，默认 `underline`。 */
  variant?: TabsVariant;
  /** 追加在最外层 tablist 上的类名。 */
  className?: string;
  /** tablist 的本地化可访问名称。 */
  'aria-label'?: string;
};

/** 从 `from` 出发按 `step` 环形查找最近的可用标签，找不到时返回原下标。 */
function findEnabledIndex(items: readonly TabItem[], from: number, step: number): number {
  const count = items.length;
  let index = from;
  for (let i = 0; i < count; i += 1) {
    index = (index + step + count) % count;
    if (items[index]?.disabled !== true) return index;
  }
  return from;
}

/** 最后一个可用标签的下标，没有可用项时返回 -1。 */
function lastEnabledIndex(items: readonly TabItem[]): number {
  for (let i = items.length - 1; i >= 0; i -= 1) {
    if (items[i]?.disabled !== true) return i;
  }
  return -1;
}

/**
 * 导航型标签栏：只负责选择，不渲染面板。
 *
 * 受控与非受控都支持；roving tabindex 让整组只占一个 Tab 停靠点，
 * 左右方向键切换并把焦点移到目标标签，Home/End 到首尾。
 * `pill` 变体用一块测量后通过 transform 定位的滑动指示器标示选中项。
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    items,
    value,
    defaultValue,
    onChange,
    variant = 'underline',
    className,
    'aria-label': ariaLabel,
  }: TabsProps,
  ref,
) {
  const [innerValue, setInnerValue] = useState<string | undefined>(defaultValue);
  const listRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // 内部需要 tablist 节点测量指示器，同时把同一个节点透传给使用方的 ref。
  const setListRef = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref !== null) ref.current = node;
    },
    [ref],
  );

  const current = value ?? innerValue;
  const declared = items.find((item) => item.id === current && item.disabled !== true);
  const fallback = items.find((item) => item.disabled !== true);
  const selectedId = declared?.id ?? fallback?.id;
  const selectedIndex = items.findIndex((item) => item.id === selectedId);

  // 指示器的宽度随文案变化，无法用等宽公式推导；这里在布局阶段直接量取并写回
  // DOM，避免一次额外的 React 提交。ResizeObserver 兜住字体加载与容器缩放。
  useLayoutEffect(() => {
    if (variant !== 'pill') return;
    const list = listRef.current;
    const indicator = indicatorRef.current;
    if (list === null || indicator === null) return;

    const update = () => {
      const tab = selectedIndex >= 0 ? tabRefs.current[selectedIndex] : null;
      if (tab === null || tab === undefined) {
        indicator.style.opacity = '0';
        return;
      }
      indicator.style.width = `${tab.offsetWidth}px`;
      indicator.style.transform = `translateX(${tab.offsetLeft}px)`;
      indicator.style.opacity = '1';
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(list);
    for (const tab of tabRefs.current) {
      if (tab !== null) observer.observe(tab);
    }
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [items, selectedIndex, variant]);

  const select = (item: TabItem) => {
    if (item.disabled === true) return;
    if (value === undefined) setInnerValue(item.id);
    onChange?.(item.id);
  };

  const onKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = findEnabledIndex(items, index, 1);
        break;
      case 'ArrowLeft':
        next = findEnabledIndex(items, index, -1);
        break;
      case 'Home':
        next = items.findIndex((item) => item.disabled !== true);
        break;
      case 'End':
        next = lastEnabledIndex(items);
        break;
      default:
        return;
    }
    if (next < 0 || next === index) return;
    event.preventDefault();
    const target = items[next];
    tabRefs.current[next]?.focus();
    if (target !== undefined) select(target);
  };

  return (
    <div
      ref={setListRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      data-variant={variant}
      className={clsx(css.tabs, className)}
    >
      {variant === 'pill' && (
        <span ref={indicatorRef} aria-hidden="true" className={css.indicator} />
      )}
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
          type="button"
          role="tab"
          aria-selected={item.id === selectedId}
          tabIndex={item.id === selectedId ? 0 : -1}
          disabled={item.disabled === true}
          className={css.tab}
          onClick={() => {
            select(item);
          }}
          onKeyDown={(event) => {
            onKeyDown(event, index);
          }}
        >
          {item.icon !== undefined && (
            <span aria-hidden="true" className={css.icon}>
              {item.icon}
            </span>
          )}
          <span className={css.label}>{item.label}</span>
          {item.badge !== undefined && (
            <span className={css.badge} data-numeric={typeof item.badge === 'number' || undefined}>
              {item.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
});
