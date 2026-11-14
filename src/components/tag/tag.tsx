import type { ReactNode } from 'react';
import clsx from 'clsx';
import css from './tag.module.css';

/** 调色板选择；每个 tone 对应一种内置外观。 */
export type TagTone =
  /** 三级文字上的发丝描边：只读默认态。 */
  | 'outline'
  /** 反色填充：一组标签里只用一个，用来标示当前选中项。 */
  | 'solid'
  /** 平台灰填充：不带状态含义的中性事实。 */
  | 'neutral'
  /** 纯文字、无填充：比 `neutral` 更低调的事实。 */
  | 'quiet'
  /** 绿色着色：健康或已启用状态。 */
  | 'success'
  /** 蓝色着色：信息性分类，不代表健康度。 */
  | 'info'
  /** 琥珀色着色：需要关注，但还不是失败。 */
  | 'warning'
  /** 红色着色：失败。 */
  | 'danger';

export type TagProps = {
  /** 使用的调色板，默认 `outline` */
  tone?: TagTone;
  /** 追加在标签上的类名，便于外部布局 */
  className?: string;
  children?: ReactNode;
};

/**
 * 只读胶囊徽标。
 *
 * 可选的胶囊按钮是 `Pill`：`Tag` 不接受 `onClick`、`active`，也不复制自己的
 * 文案，文案由渲染方提供。
 */
export function Tag({ tone = 'outline', className, children }: TagProps) {
  return (
    <span className={clsx(css.tag, className)} data-tone={tone}>
      {children}
    </span>
  );
}
