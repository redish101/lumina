'use client';

import clsx from 'clsx';
import css from './switch.module.css';

export type SwitchProps = {
  /** 当前状态；组件完全受控 */
  checked: boolean;
  /** 点击时回调请求切换到的状态 */
  onChange: (next: boolean) => void;
  /** 本地化的可访问名称，由渲染方提供，必填 */
  label: string;
  /** 是否拒绝输入；写入进行中也应置为禁用，而不只在部署锁定时 */
  disabled?: boolean;
  /** 本地化的悬浮提示，通常解释开关为何被锁定 */
  title?: string;
  /** 追加在开关上的类名，便于外部布局 */
  className?: string;
  /** 挂载且可用时是否自动获得焦点 */
  autoFocus?: boolean;
  /** 描述该控件的元素 id */
  describedBy?: string;
};

/**
 * 双态开关。
 *
 * `label` 必填且没有默认值，避免渲染方发布一个没有可访问名称的控件。
 * 开关外观由 `aria-checked` 驱动，视觉状态不会与辅助技术读到的状态不一致。
 */
export function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  title,
  className,
  autoFocus,
  describedBy,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      title={title}
      disabled={disabled}
      autoFocus={autoFocus}
      className={clsx(css.switch, className)}
      onClick={() => {
        onChange(!checked);
      }}
    >
      <span className={css.thumb} />
    </button>
  );
}
