'use client';

import { forwardRef, useId, useState, type ChangeEvent, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './radio-group.module.css';

/** `RadioGroup` 中的一个单选项。 */
export interface RadioGroupOption {
  /** 选中后提交的值 */
  value: string;
  /** 展示给用户的文案，同时作为该项的可访问名称 */
  label: ReactNode;
  /** 是否禁止选中 */
  disabled?: boolean;
}

export type RadioGroupProps = {
  /** 按展示顺序排列的选项 */
  options: readonly RadioGroupOption[];
  /** 当前值（受控） */
  value?: string;
  /** 初始值（非受控） */
  defaultValue?: string;
  /** 选择变化时回调，第一个参数是选中的值 */
  onChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  /** 选项的排列方向 */
  orientation?: 'vertical' | 'horizontal';
  /** 组标题，渲染为 `<legend>` */
  label?: ReactNode;
  /** 错误态：标题变红并同步 `aria-invalid` */
  error?: boolean;
  /** 原生 radio 的 name；缺省时用 useId 生成，保证同组互斥 */
  name?: string;
  /** 追加在最外层 `<fieldset>` 上的类名 */
  className?: string;
};

/**
 * 单选组。
 *
 * 用 `<fieldset>` + `<legend>` 表达分组，内部是同名原生 `<input type="radio">`，
 * 因此方向键切换、表单提交与读屏播报都由浏览器原生行为提供；圆点外观由
 * `appearance: none` + 内阴影自绘，不依赖额外图标。
 */
export const RadioGroup = forwardRef<HTMLFieldSetElement, RadioGroupProps>(function RadioGroup(
  {
    options,
    value,
    defaultValue,
    onChange,
    orientation = 'vertical',
    label,
    error = false,
    name,
    className,
  },
  ref,
) {
  const generatedName = useId();
  const groupName = name ?? generatedName;
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const current = value !== undefined ? value : uncontrolledValue;

  return (
    <fieldset
      ref={ref}
      className={clsx(css.group, error && css.invalid, className)}
      aria-invalid={error || undefined}
    >
      {label != null && <legend className={css.legend}>{label}</legend>}
      <div className={clsx(css.options, css[orientation])}>
        {options.map((option) => (
          <label
            key={option.value}
            className={clsx(css.option, option.disabled === true && css.disabled)}
          >
            <input
              type="radio"
              className={css.input}
              name={groupName}
              value={option.value}
              checked={current === option.value}
              disabled={option.disabled}
              onChange={(event) => {
                if (value === undefined) setUncontrolledValue(option.value);
                onChange?.(option.value, event);
              }}
            />
            <span className={css.optionLabel}>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
});
