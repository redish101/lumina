'use client';

/** 展示一条命令文本：超宽时可横向滚动，并让溢出内容可获得键盘焦点。 */
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import css from './command-text.module.css';

export interface CommandTextProps {
  /** 要展示的命令文本，换行符会保留。 */
  text: string;
  /** 命令的读屏名称，仅在内容溢出时用于聚焦区域。 */
  label: string;
  /** 追加在外层文本上的类名。 */
  className?: string;
}

/**
 * 命令文本。
 *
 * 保留空白并用横向滚动容纳长命令；一旦内容溢出，就变成可聚焦的
 * `group`，方便键盘用户滚动查看完整命令。
 */
export function CommandText({ text, label, className }: CommandTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node === null) return;

    const update = () => {
      setOverflowing(node.scrollWidth > node.clientWidth + 1);
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    document.fonts?.addEventListener('loadingdone', update);

    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', update);
    };
  }, [text]);

  return (
    <span
      ref={ref}
      className={clsx(css.text, className)}
      data-command-text=""
      role={overflowing ? 'group' : undefined}
      aria-label={overflowing ? label : undefined}
      tabIndex={overflowing ? 0 : undefined}
      title={overflowing ? text : undefined}
    >
      {text}
    </span>
  );
}
