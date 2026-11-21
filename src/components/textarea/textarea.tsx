'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import { Field, useFieldControl } from '../field';
import css from './textarea.module.css';

// SSR 下 `useLayoutEffect` 会告警，因此服务端渲染回退到 `useEffect`。
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export type TextareaProps = {
  /** 初始可见行数，默认 3 */
  rows?: number;
  /** 是否根据内容自动撑高；开启后忽略 `resize`，改为由组件计算高度 */
  autoResize?: boolean;
  /** `autoResize` 时最多展开的行数，超出后出现滚动条 */
  maxRows?: number;
  /** 是否允许用户手动调整高度；`autoResize` 开启时固定为不可调整 */
  resize?: 'none' | 'vertical';
  /** 错误态：红色边框并同步 `aria-invalid` */
  error?: boolean;
  /** 字段标签；提供时组件内部用 Field 完成排版与无障碍关联 */
  label?: ReactNode;
  /** 标签下方的辅助说明；提供时组件内部用 Field 完成排版与无障碍关联 */
  description?: ReactNode;
  /** 追加在最外层元素上的类名 */
  className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows' | 'className'>;

type TextareaControlProps = Omit<TextareaProps, 'label' | 'description' | 'className'> & {
  className?: string;
};

const TextareaControl = forwardRef<HTMLTextAreaElement, TextareaControlProps>(
  function TextareaControl(
    {
      rows = 3,
      autoResize = false,
      maxRows,
      resize = 'vertical',
      error = false,
      id,
      className,
      value,
      onInput,
      ...rest
    },
    ref,
  ) {
    const field = useFieldControl();
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current!, []);

    const resizeToContent = useCallback(() => {
      const el = innerRef.current;
      if (el === null) return;

      // 先把高度归零，让 scrollHeight 反映当前内容的真实高度。
      el.style.height = 'auto';
      const styles = window.getComputedStyle(el);
      const lineHeight = Number.parseFloat(styles.lineHeight) || 22;
      const padding =
        (Number.parseFloat(styles.paddingTop) || 0) +
        (Number.parseFloat(styles.paddingBottom) || 0);
      const maxHeight = maxRows != null ? lineHeight * maxRows + padding : Number.POSITIVE_INFINITY;
      const nextHeight = Math.min(el.scrollHeight, maxHeight);

      el.style.height = `${nextHeight}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [maxRows]);

    useIsomorphicLayoutEffect(() => {
      const el = innerRef.current;
      if (el === null) return;

      if (!autoResize) {
        // 关闭 autoResize 时清掉之前写入的行内高度，交还给 rows 与 CSS。
        el.style.height = '';
        el.style.overflowY = '';
        return;
      }

      resizeToContent();
    }, [autoResize, resizeToContent, value]);

    // 容器变宽/变窄会改变折行行数，需要重新测量；只响应宽度变化，避免和
    // 自身写入高度形成的尺寸变化互相触发。
    useIsomorphicLayoutEffect(() => {
      if (!autoResize) return;
      const el = innerRef.current;
      if (el === null || typeof ResizeObserver === 'undefined') return;

      let lastWidth = el.clientWidth;
      const observer = new ResizeObserver(() => {
        if (el.clientWidth === lastWidth) return;
        lastWidth = el.clientWidth;
        resizeToContent();
      });
      observer.observe(el);
      return () => {
        observer.disconnect();
      };
    }, [autoResize, resizeToContent]);

    const {
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
      ...textareaProps
    } = rest;

    const describedBy =
      [ariaDescribedBy, field?.['aria-describedby']].filter(Boolean).join(' ') || undefined;
    const invalid =
      error || ariaInvalid === true || ariaInvalid === 'true' || field?.['aria-invalid'] === true;

    return (
      <span className={clsx(css.wrap, invalid && css.invalid, className)}>
        <textarea
          ref={innerRef}
          id={id ?? field?.id}
          rows={rows}
          value={value}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={clsx(
            css.textarea,
            autoResize ? css.autoResize : resize === 'vertical' && css.resizeVertical,
          )}
          {...textareaProps}
          onInput={(event) => {
            onInput?.(event);
            if (autoResize) resizeToContent();
          }}
        />
      </span>
    );
  },
);

/**
 * 多行文本输入框。
 *
 * 外层容器负责边框与聚焦态，原生 `<textarea>` 去边框；开启 `autoResize` 后
 * 组件按 `scrollHeight` 撑高，并用 `maxRows` 限制最大行数（超出后出现滚动条）。
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, description, error = false, className, id, ...rest },
  ref,
) {
  if (label == null && description == null) {
    return <TextareaControl ref={ref} id={id} error={error} className={className} {...rest} />;
  }

  return (
    <Field className={className} label={label} description={description} htmlFor={id}>
      <TextareaControl ref={ref} id={id} error={error} {...rest} />
    </Field>
  );
});
