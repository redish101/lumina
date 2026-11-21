'use client';

/** 折叠内容底部的文字按钮，显示剩余行数并切换展开状态。 */
import clsx from 'clsx';
import css from './fold-toggle.module.css';

export interface FoldToggleLabels {
  /** 展开状态下的无障碍名称。 */
  collapseAria: string;
  /** 收起状态下的无障碍名称，参数是隐藏的行数。 */
  expandAria: (hidden: number) => string;
  /** 展开状态下的按钮文字。 */
  collapse: string;
  /** 收起状态下的按钮文字，参数是隐藏的行数。 */
  expand: (hidden: number) => string;
}

export interface FoldToggleProps {
  /** 当前是否已展开。 */
  expanded: boolean;
  /** 被折叠的行数。 */
  hidden: number;
  /** 按钮文案与无障碍名称。 */
  labels: FoldToggleLabels;
  /** 切换展开状态。 */
  onToggle: () => void;
  /** 可选的内容区域 id，用于 `aria-controls`。 */
  controls?: string;
  /** 追加在按钮上的类名。 */
  className?: string;
}

/**
 * 折叠开关。
 *
 * 一个铺满宽度的文字按钮，展开时显示「收起」，收起时显示剩余行数；
 * 通过 `aria-expanded` 与可选的 `aria-controls` 描述它控制的内容。
 */
export function FoldToggle({
  expanded,
  hidden,
  labels,
  onToggle,
  controls,
  className,
}: FoldToggleProps) {
  return (
    <button
      type="button"
      className={clsx(css.toggle, className)}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={expanded ? labels.collapseAria : labels.expandAria(hidden)}
      onClick={onToggle}
    >
      {expanded ? labels.collapse : labels.expand(hidden)}
    </button>
  );
}
