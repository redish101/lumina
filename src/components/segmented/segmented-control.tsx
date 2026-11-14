'use client';

import { useEffect, useRef, type CSSProperties, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import css from './segmented-control.module.css';

/** SegmentedControl 中的一个分段。 */
export interface SegmentedControlOption<Value extends string> {
  /** 选中后交给使用方的值。 */
  value: Value;
  /** 分段的本地化文案。 */
  label: string;
  /** 是否禁止选中该分段。 */
  disabled?: boolean;
  /** 本地化的悬停提示，通常说明该分段为何被锁定。 */
  title?: string;
}

/** WAI-ARIA tabs 模式中用于在分段间移动焦点的按键。 */
type WalkKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End';

function isWalkKey(key: string): key is WalkKey {
  return (
    key === 'ArrowLeft' ||
    key === 'ArrowRight' ||
    key === 'ArrowUp' ||
    key === 'ArrowDown' ||
    key === 'Home' ||
    key === 'End'
  );
}

/**
 * 从当前选中项出发，走到某个移动键落点的已启用分段：方向键跳到最近的可选
 * 邻居并循环，Home 与 End 跳到第一个和最后一个可选分段。
 */
function walk<Value extends string>(
  options: readonly SegmentedControlOption<Value>[],
  from: number,
  key: WalkKey,
): SegmentedControlOption<Value> | undefined {
  const enabled = options.filter((option) => option.disabled !== true);
  if (key === 'Home') return enabled[0];
  if (key === 'End') return enabled[enabled.length - 1];
  const step = key === 'ArrowRight' || key === 'ArrowDown' ? 1 : -1;
  const count = options.length;
  for (let offset = 1; offset < count; offset += 1) {
    const candidate = options[(((from + step * offset) % count) + count) % count];
    if (candidate !== undefined && candidate.disabled !== true) return candidate;
  }
  return undefined;
}

export type SegmentedControlProps<Value extends string = string> = {
  /**
   * 使用方提供的基础 id：每个分段是 `<id>-<value>`，并把它控制的面板
   * `<id>-<value>-panel` 写进 `aria-controls`。
   */
  id: string;
  /** 当前选中的值；组件完全受控。 */
  value: Value;
  /** 按展示顺序排列的分段，至少两个。 */
  options: readonly SegmentedControlOption<Value>[];
  /** 点击或键盘操作请求切换时触发，不会用已选中的值回调。 */
  onChange: (next: Value) => void;
  /** tablist 的本地化可访问名称。 */
  label: string;
  /** 禁用全部分段，通常用于面板上有写入或请求正在进行、切换会中断它时。 */
  disabled?: boolean;
  /** 追加在外层容器上的类名，用于布局定位。 */
  className?: string | undefined;
};

/**
 * 分段控制器。
 *
 * 一个等宽分段组成的 tablist，选中态由一块白色滑块表示；滑块位置由组件通过
 * `--dsh-segment-count` / `--dsh-segment-index` 两个自定义属性交给 CSS 计算，
 * 不需要测量 DOM。点击或方向键只报告请求的值，选中状态始终由使用方持有。
 */
export function SegmentedControl<Value extends string>({
  id,
  value,
  options,
  onChange,
  label,
  disabled = false,
  className,
}: SegmentedControlProps<Value>) {
  const list = useRef<HTMLDivElement>(null);
  const selected = options.findIndex((option) => option.value === value);

  // 移动键只报告下一个值，使用方重渲染后键盘焦点再跟上选中项，
  // 这样 roving tabindex 才始终可用。
  useEffect(() => {
    const root = list.current;
    if (root === null) return;
    if (!root.contains(document.activeElement)) return;
    root.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
  }, [value]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    if (!isWalkKey(event.key)) return;
    event.preventDefault();
    const target = walk(options, selected, event.key);
    if (target !== undefined && target.value !== value) onChange(target.value);
  };

  const indicator = {
    '--dsh-segment-count': String(options.length),
    '--dsh-segment-index': String(selected),
  } as CSSProperties;

  return (
    <div
      ref={list}
      role="tablist"
      aria-label={label}
      className={clsx(css.control, className)}
      style={indicator}
    >
      <span aria-hidden="true" className={css.indicator} />
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            id={`${id}-${option.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`${id}-${option.value}-panel`}
            tabIndex={active ? 0 : -1}
            disabled={disabled || option.disabled === true}
            title={option.title}
            className={css.tab}
            onClick={() => {
              if (!active) onChange(option.value);
            }}
            onKeyDown={onKeyDown}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
