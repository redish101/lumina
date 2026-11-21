import type { ReactNode } from 'react';
import clsx from 'clsx';
import css from './form-error.module.css';

export type FormErrorProps = {
  /** 错误文案；与 `children` 二选一 */
  message?: ReactNode;
  /** 自定义错误内容；`message` 缺省时使用 */
  children?: ReactNode;
  /** 追加在最外层容器上的类名 */
  className?: string;
};

/**
 * 表单级错误条。
 *
 * 有内容时以 `role="alert"` 渲染，错误在出现或变化时会被读屏立即播报；
 * 没有内容时不渲染任何 DOM，方便直接挂载在条件分支里。
 */
export function FormError({ message, children, className }: FormErrorProps) {
  const content = message ?? children;
  if (content == null) return null;

  return (
    <div className={clsx(css.error, className)} role="alert">
      {content}
    </div>
  );
}
