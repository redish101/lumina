'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './button.module.css';

/** Visual variant, each backed by its --lumina-alias-button-* token family. */
export type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'toolbar';

export type ButtonProps = {
  variant?: ButtonVariant;
  size?: 'md' | 'sm';
  icon?: ReactNode;
  className?: string | undefined;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

/**
 * 按钮。
 *
 * 默认渲染原生 `<button type="button">`，其余原生属性原样透传；
 * ref 指向该 button，便于焦点管理与浮层定位。
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'ghost', size = 'md', icon, className, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(css.button, css[variant], css[size], className)}
      {...rest}
    >
      {icon != null && <span className={css.icon}>{icon}</span>}
      {children}
    </button>
  );
});
