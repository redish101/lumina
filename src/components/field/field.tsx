'use client';

import { createContext, useContext, useId, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './field.module.css';

/** `Field` 通过 context 下发给控件的无障碍关联属性。 */
export interface FieldControlA11y {
  /** 与 label 的 `htmlFor` 配对的控件 id。 */
  id?: string;
  /** description 与 error 对应元素的 id，空格分隔。 */
  'aria-describedby'?: string;
  /** 字段处于错误态时为 true。 */
  'aria-invalid'?: boolean;
}

const FieldContext = createContext<FieldControlA11y | null>(null);

/**
 * 读取外层 `Field` 下发的控件 id 与 ARIA 关联。
 *
 * 不在 `Field` 内使用时返回 `null`，控件可据此回退到自己的 id 与属性。
 */
export function useFieldControl(): FieldControlA11y | null {
  return useContext(FieldContext);
}

export type FieldProps = {
  /** 字段标签，可传任意 React 节点 */
  label?: ReactNode;
  /** 标签下方的辅助说明，会通过 `aria-describedby` 关联到控件 */
  description?: ReactNode;
  /** 错误文案；存在时字段进入错误态并同步 `aria-invalid` */
  error?: ReactNode;
  /** 是否在标签后显示必填星号 */
  required?: boolean;
  /** 与子控件 id 配对的 htmlFor；缺省时自动生成 */
  htmlFor?: string;
  /** 字段控件，通常是一个 Input、Textarea 或 Select */
  children?: ReactNode;
  /** 追加在最外层容器上的类名 */
  className?: string;
  /** 标签与控件的排布方向 */
  orientation?: 'vertical' | 'horizontal';
};

/**
 * 表单字段外壳，负责 label、描述与错误文案的排版及无障碍关联。
 *
 * 生成的 id、`aria-describedby` 与 `aria-invalid` 会通过 context 提供给子控件，
 * 子控件可以用 `useFieldControl()` 读取；也可以自行传入 `id` 与 `htmlFor`。
 */
export function Field({
  label,
  description,
  error,
  required = false,
  htmlFor,
  children,
  className,
  orientation = 'vertical',
}: FieldProps) {
  const generatedId = useId();
  const controlId = htmlFor ?? generatedId;
  const descriptionId = `${generatedId}-description`;
  const errorId = `${generatedId}-error`;

  const describedBy =
    [description != null && descriptionId, error != null && errorId].filter(Boolean).join(' ') ||
    undefined;

  const control: FieldControlA11y = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': error != null ? true : undefined,
  };

  return (
    <div className={clsx(css.field, css[orientation], label == null && css.noLabel, className)}>
      {label != null && (
        <label className={css.label} htmlFor={controlId}>
          {label}
          {required && (
            <span className={css.required} aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <div className={css.control}>
        <FieldContext.Provider value={control}>{children}</FieldContext.Provider>
      </div>
      {(description != null || error != null) && (
        <div className={css.messages}>
          {description != null && (
            <p id={descriptionId} className={css.description}>
              {description}
            </p>
          )}
          {error != null && (
            <p id={errorId} className={css.error} role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
