'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './input.module.css';

export type InputProps = {
  /** 可选的 16px 前置图标 */
  icon?: ReactNode;
  /** 追加在外层容器上的类名 */
  className?: string;
} & InputHTMLAttributes<HTMLInputElement>;

/**
 * 文本输入框。
 *
 * 外层 span 负责边框、图标与聚焦态，原生 `<input>` 负责取值与事件；
 * ref 指向该 input，卸载时自动置空。
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { icon, className, ...rest },
  ref,
) {
  return (
    <span className={clsx(css.wrap, className)}>
      {icon != null && <span className={css.icon}>{icon}</span>}
      <input ref={ref} className={css.input} {...rest} />
    </span>
  );
});
