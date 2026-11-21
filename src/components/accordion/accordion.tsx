'use client';

import { forwardRef, useId, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutline } from '../../icons';
import css from './accordion.module.css';

/** 一个折叠项的数据。 */
export interface AccordionItem {
  /** 稳定且唯一的标识，受控值通过它比较。 */
  id: string;
  /** 标题栏内容，通常是一行文本。 */
  title: ReactNode;
  /** 展开后渲染的内容，可以是任意节点。 */
  content: ReactNode;
  /** 禁用后无法展开，键盘漫游也会跳过它。 */
  disabled?: boolean;
}

export type AccordionProps = {
  /** 按展示顺序排列的折叠项。 */
  items: readonly AccordionItem[];
  /** 受控的展开 id 列表；提供时组件不再自行维护状态。 */
  value?: readonly string[];
  /** 非受控模式下的初始展开列表，默认全部收起。 */
  defaultValue?: readonly string[];
  /** 展开或收起后触发，参数是新的展开 id 列表。 */
  onChange?: (ids: string[]) => void;
  /** 是否允许同时展开多项，默认一次只展开一项。 */
  multiple?: boolean;
  /** 追加在最外层容器上的类名。 */
  className?: string;
};

/** 从 `from` 按 `step` 环形查找最近的可用折叠项，找不到时返回原下标。 */
function findEnabledIndex(items: readonly AccordionItem[], from: number, step: number): number {
  const count = items.length;
  let index = from;
  for (let i = 0; i < count; i += 1) {
    index = (index + step + count) % count;
    if (items[index]?.disabled !== true) return index;
  }
  return from;
}

/**
 * 折叠面板：点击标题展开内容，同一时刻可以只开一项，也可以开多项。
 *
 * 自绘按钮而不是 `<details>`，是为了用 grid-template-rows 的 0fr → 1fr
 * 过渡拿到无需测量高度的展开动画；收起时面板保留在 DOM 中并加 `inert`
 * 与 `aria-hidden`，内容里的可聚焦元素不会被 Tab 到。
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  { items, value, defaultValue = [], onChange, multiple = false, className }: AccordionProps,
  ref,
) {
  const baseId = useId();
  const [innerValue, setInnerValue] = useState<readonly string[]>(defaultValue);
  const headerRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const openIds = value ?? innerValue;

  const toggle = (item: AccordionItem) => {
    if (item.disabled === true) return;
    const isOpen = openIds.includes(item.id);
    const next = isOpen
      ? openIds.filter((id) => id !== item.id)
      : multiple
        ? [...openIds, item.id]
        : [item.id];
    if (value === undefined) setInnerValue(next);
    onChange?.(next);
  };

  const onHeaderKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
    let next: number;
    switch (event.key) {
      case 'ArrowDown':
        next = findEnabledIndex(items, index, 1);
        break;
      case 'ArrowUp':
        next = findEnabledIndex(items, index, -1);
        break;
      case 'Home':
        next = 0;
        while (next < items.length && items[next]?.disabled === true) next += 1;
        break;
      case 'End':
        next = items.length - 1;
        while (next >= 0 && items[next]?.disabled === true) next -= 1;
        break;
      default:
        return;
    }
    if (next < 0 || next >= items.length || next === index) return;
    event.preventDefault();
    headerRefs.current[next]?.focus();
  };

  return (
    <div ref={ref} className={clsx(css.accordion, className)}>
      {items.map((item, index) => {
        const isOpen = openIds.includes(item.id);
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;
        return (
          <div key={item.id} className={css.item} data-open={isOpen || undefined}>
            <h3 className={css.heading}>
              <button
                ref={(node) => {
                  headerRefs.current[index] = node;
                }}
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-disabled={item.disabled === true}
                disabled={item.disabled === true}
                className={css.trigger}
                onClick={() => {
                  toggle(item);
                }}
                onKeyDown={(event) => {
                  onHeaderKeyDown(event, index);
                }}
              >
                <span className={css.title}>{item.title}</span>
                <span aria-hidden="true" className={css.chevron} data-open={isOpen || undefined}>
                  <IconChevronDownOutline />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              className={css.panel}
              aria-hidden={!isOpen}
              data-open={isOpen || undefined}
              inert={!isOpen}
            >
              <div role="region" aria-labelledby={triggerId} className={css.panelInner}>
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
