'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import css from './pill.module.css';

export type PillProps = {
  /** 选中/激活的视觉状态 */
  active?: boolean;
  /** 追加在胶囊上的类名 */
  className?: string;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 胶囊标签。
 *
 * 传入 `onClick` 时渲染为可交互的 `<button>`；否则渲染为静态 `<span>`，
 * 用于只读的状态展示（例如终端退出码）。11px 的只读徽标请用 `Tag`。
 */
export function Pill({ active = false, className, children, onClick, ...rest }: PillProps) {
  if (!onClick) {
    return <span className={clsx(css.pill, active && css.active, className)}>{children}</span>;
  }
  return (
    <button
      type="button"
      className={clsx(css.pill, css.interactive, active && css.active, className)}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
