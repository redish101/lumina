'use client';

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import { Field, useFieldControl } from '../field';
import css from './select.module.css';

/** `Select` 中的一个选项。 */
export interface SelectOption {
  /** 提交给表单的值 */
  value: string;
  /** 展示给用户的文案 */
  label: ReactNode;
  /** 是否禁止选中 */
  disabled?: boolean;
}

export type SelectProps = {
  /** 按展示顺序排列的选项 */
  options: readonly SelectOption[];
  /** 未选择时显示的占位项；会渲染为一个禁用的空值 option */
  placeholder?: string;
  /** 当前值（受控） */
  value?: string;
  /** 初始值（非受控） */
  defaultValue?: string;
  /** 选择变化时回调，第一个参数是选中的值 */
  onChange?: (value: string, event: ChangeEvent<HTMLSelectElement>) => void;
  /** 字段标签；提供时组件内部用 Field 完成排版与无障碍关联 */
  label?: ReactNode;
  /** 标签下方的辅助说明；提供时组件内部用 Field 完成排版与无障碍关联 */
  description?: ReactNode;
  /** 错误态：红色边框并同步 `aria-invalid` */
  error?: boolean;
  /** 追加在最外层元素上的类名 */
  className?: string;
} & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'className'
>;

type SelectControlProps = Omit<SelectProps, 'label' | 'description' | 'className'> & {
  className?: string;
};

const SelectControl = forwardRef<HTMLSelectElement, SelectControlProps>(function SelectControl(
  { options, placeholder, value, defaultValue, onChange, error = false, id, className, ...rest },
  ref,
) {
  const field = useFieldControl();
  const innerRef = useRef<HTMLSelectElement>(null);
  useImperativeHandle(ref, () => innerRef.current!, []);

  const { 'aria-describedby': ariaDescribedBy, 'aria-invalid': ariaInvalid, ...selectProps } = rest;

  const invalid =
    error || ariaInvalid === true || ariaInvalid === 'true' || field?.['aria-invalid'] === true;
  const describedBy =
    [ariaDescribedBy, field?.['aria-describedby']].filter(Boolean).join(' ') || undefined;
  const isControlled = value !== undefined;

  return (
    <span
      className={clsx(
        css.wrap,
        invalid && css.invalid,
        selectProps.disabled && css.disabled,
        className,
      )}
    >
      <select
        ref={innerRef}
        className={css.select}
        id={id ?? field?.id}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        {...selectProps}
        {...(isControlled
          ? { value }
          : { defaultValue: defaultValue ?? (placeholder != null ? '' : undefined) })}
        onChange={(event) => {
          onChange?.(event.target.value, event);
        }}
      >
        {placeholder != null && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={css.chevron} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" strokeWidth={1}>
          <path
            d="M4 6L7.29289 9.29289C7.68342 9.68342 8.31658 9.68342 8.70711 9.29289L12 6"
            stroke="currentColor"
          />
        </svg>
      </span>
    </span>
  );
});

/**
 * 下拉选择器。
 *
 * 视觉外壳与原生的 `<select>` 分离：外壳负责边框、聚焦态与右侧 chevron，
 * 原生 select 去掉 `appearance` 后仍保留浏览器的键盘与表单行为。
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, description, error = false, className, id, ...rest },
  ref,
) {
  if (label == null && description == null) {
    return <SelectControl ref={ref} id={id} error={error} className={className} {...rest} />;
  }

  return (
    <Field className={className} label={label} description={description} htmlFor={id}>
      <SelectControl ref={ref} id={id} error={error} {...rest} />
    </Field>
  );
});
