'use client';

import clsx from 'clsx';
import css from './checkbox.module.css';

export interface CheckboxProps {
  /** 当前是否勾选（受控） */
  checked: boolean;
  /** 用户请求的新状态，由调用方写回 `checked` */
  onChange: (next: boolean) => void;
  /** 可见文案，同时作为无障碍名称 */
  label: string;
  /** 禁用状态 */
  disabled?: boolean;
  /** 悬停时的提示文案 */
  title?: string | undefined;
  /** 追加在外层 `<label>` 上的类名 */
  className?: string | undefined;
  /** 保留位：给未来的浮层组件标记初始焦点，当前不影响渲染 */
  modalAutofocus?: boolean;
}

/**
 * 带文字标签的受控复选框。
 *
 * 直接使用原生 `<input type="checkbox">`，因此键盘操作与表单提交行为与浏览器一致。
 */
export function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  title,
  className,
  modalAutofocus = false,
}: CheckboxProps) {
  return (
    <label className={clsx(css.checkbox, className)} title={title}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        data-modal-autofocus={modalAutofocus || undefined}
        onChange={(event) => {
          onChange(event.target.checked);
        }}
      />
      <span>{label}</span>
    </label>
  );
}
