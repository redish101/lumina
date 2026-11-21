'use client';

/** 带标题栏和复制按钮的代码块，可选行号与自动换行。 */
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconCheckOutline } from '../../icons';
import css from './code-card.module.css';

export interface CodeCardProps {
  /** 要高亮展示的代码原文。 */
  code: string;
  /** 头部展示的语言标签，例如 `tsx`。 */
  language?: string;
  /** 头部展示的标题，超长时省略。 */
  title?: string;
  /** 头部右侧的状态文字。 */
  status?: string;
  /** 是否显示行号。 */
  showLineNumbers?: boolean;
  /** 是否让超长行自动换行；默认横向滚动。 */
  wrap?: boolean;
  /** 是否显示复制按钮，默认 `true`。 */
  copyable?: boolean;
  /** 复制按钮的默认文案。 */
  copyLabel?: string;
  /** 复制成功后的反馈文案。 */
  copiedLabel?: string;
  /** 追加在卡片上的类名。 */
  className?: string;
}

function CopyIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" />
      <path d="M10.5 3.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" />
    </svg>
  );
}

function splitLines(code: string): string[] {
  if (code === '') return [''];
  const lines = code.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

/**
 * 代码卡片。
 *
 * 头部展示语言、标题、状态和复制按钮，正文默认横向滚动并可选行号。
 * 复制成功后在 1.2 秒内显示「已复制」；剪贴板不可用时静默失败。
 */
export function CodeCard({
  code,
  language,
  title,
  status,
  showLineNumbers = false,
  wrap = false,
  copyable = true,
  copyLabel = '复制',
  copiedLabel = '已复制',
  className,
}: CodeCardProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lines = splitLines(code);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || navigator.clipboard === undefined) return;
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      timer.current = null;
    }, 1200);
  };

  return (
    <div className={clsx(css.card, className)}>
      <div className={css.header}>
        <div className={css.heading}>
          {language !== undefined && <span className={css.language}>{language}</span>}
          {title !== undefined && <span className={css.title}>{title}</span>}
          {language === undefined && title === undefined && (
            <span className={css.language}>代码</span>
          )}
        </div>
        <div className={css.actions}>
          {status !== undefined && <span className={css.status}>{status}</span>}
          {copyable && (
            <button
              type="button"
              className={css.action}
              aria-label={copied ? copiedLabel : copyLabel}
              onClick={handleCopy}
            >
              {copied ? <IconCheckOutline size={13} /> : <CopyIcon />}
              <span>{copied ? copiedLabel : copyLabel}</span>
            </button>
          )}
        </div>
      </div>

      <div className={css.body}>
        <pre
          className={css.pre}
          data-wrap={wrap ? '' : undefined}
          data-line-numbers={showLineNumbers ? '' : undefined}
        >
          <code>
            {lines.map((line, index) => (
              <span key={index} className={css.line}>
                {line}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
