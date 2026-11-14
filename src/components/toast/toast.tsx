'use client';

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { IconCheckCircleOutline } from '../../icons';
import css from './toast.module.css';

/** 未指定 holdMs 时，淡出前保持全不透明的时间。 */
const HOLD_MS = 3000;
/** 淡出时长，必须与样式表里的 toast-fade 动画保持一致。 */
const FADE_MS = 1000;

export type ToastTone = 'success';

/** Toast 正文后紧跟的一个行内动作，例如「撤销」。 */
export interface ToastAction {
  /** 动作文案。 */
  label: string;
  /** 连接正文与动作的前缀，例如「或」。 */
  prefix?: string;
  /** 点击动作时触发，由使用方处理具体逻辑。 */
  onClick: () => void;
}

export type ToastProps = {
  /** 已解析好的提示文案，由使用方负责本地化。 */
  text: string;
  /** 可选的前置图标，例如警告图标；`tone="success"` 时忽略，因为自带图标。 */
  icon?: ReactNode;
  /** `success` 用设计稿里的圆形绿色对勾作前置图标；省略时图标位保留警告色。 */
  tone?: ToastTone;
  /** 可选的水平居中参照元素，例如输入卡片；省略时相对视口居中。 */
  anchor?: HTMLElement | null;
  /** 淡出前保持全不透明的时间，默认 3000ms。 */
  holdMs?: number;
  /**
   * 可选的行内动作，接在正文后面，读起来是一句话：先渲染纯文本 `prefix`（如
   * 「或」），再渲染蓝色可点的 `label`。提示条本体不拦截点击，只有动作文字接收指针。
   */
  actions?: readonly ToastAction[];
  /** 淡出完成后调用一次，使用方在这里卸载 Toast。 */
  onDone: () => void;
};

/**
 * 顶部居中的瞬时提示条：滑入、保持、淡出，然后回调使用方卸载。
 *
 * 通过 body portal 渲染，避免使用方处于 transform/filter 祖先时把 fixed 提示条
 * 困在祖先盒子里。保持时长由使用方决定：同一个值既驱动卸载定时器，也作为
 * `--dsh-toast-hold` 交给样式表控制淡出延迟，两者不会失配。
 * 使用方要重复展示同一段文字时，用一次性的 key 重新挂载即可重启动画。
 */
export function Toast({ text, icon, tone, anchor, holdMs = HOLD_MS, actions, onDone }: ToastProps) {
  const latestOnDone = useRef(onDone);
  useLayoutEffect(() => {
    latestOnDone.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const timer = setTimeout(() => {
      latestOnDone.current();
    }, holdMs + FADE_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [holdMs]);

  // 以参照元素居中时，窗口尺寸变化后重新测量；提示条只存在几秒，
  // 这段时间内的子窗口布局漂移不在处理范围内。
  const [left, setLeft] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (anchor == null) return;
    const measure = (): void => {
      const rect = anchor.getBoundingClientRect();
      setLeft(rect.left + rect.width / 2);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
    };
  }, [anchor]);

  // 本库直接发布源码、由 Next.js 编译，服务端没有 body 可挂 portal。
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={css.toast}
      role="alert"
      style={
        {
          ...(left === null ? {} : { left }),
          '--dsh-toast-hold': `${String(holdMs)}ms`,
        } as CSSProperties
      }
    >
      {tone === 'success' ? (
        <span className={clsx(css.icon, css.success)} aria-hidden="true">
          <IconCheckCircleOutline />
        </span>
      ) : (
        icon !== undefined && (
          <span className={css.icon} aria-hidden="true">
            {icon}
          </span>
        )
      )}
      <span className={css.text}>
        {text}
        {actions?.map((action) => (
          <Fragment key={action.label}>
            {action.prefix}
            <button type="button" className={css.action} onClick={action.onClick}>
              {action.label}
            </button>
          </Fragment>
        ))}
      </span>
    </div>,
    document.body,
  );
}
