import clsx from 'clsx';
import type { ReactNode } from 'react';
import css from './field-group.module.css';

export type FieldGroupProps = {
  /** 组的标题，渲染为 `<legend>` */
  title?: ReactNode;
  /** 标题下方的辅助说明 */
  description?: ReactNode;
  /** 字段网格的列数；窄屏下多列会自动回落为单列 */
  columns?: 1 | 2 | 3;
  /** 组内的字段 */
  children?: ReactNode;
  /** 追加在最外层 `<fieldset>` 上的类名 */
  className?: string;
};

/**
 * 一组相关字段的外壳。
 *
 * 使用 `<fieldset>` + `<legend>` 保留分组语义，字段按 `columns` 排成网格；
 * 窄屏下两列和三列都会回落为单列，避免控件被挤得过窄。
 */
export function FieldGroup({
  title,
  description,
  columns = 1,
  children,
  className,
}: FieldGroupProps) {
  return (
    <fieldset className={clsx(css.group, className)}>
      {title != null && <legend className={css.title}>{title}</legend>}
      {description != null && <p className={css.description}>{description}</p>}
      <div className={clsx(css.items, css[`columns${columns}`])}>{children}</div>
    </fieldset>
  );
}
