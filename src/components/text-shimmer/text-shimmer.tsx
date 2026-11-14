'use client';

/** 行与其嵌套文本片段共享的文字活动动画。 */
import { createContext, memo, useContext, type ReactNode } from 'react';
import clsx from 'clsx';
import css from './text-shimmer.module.css';

const DecorativeCopy = createContext<boolean | undefined>(undefined);

/** 承载行提供的文本与活动状态。 */
export interface TextShimmerProps {
  /** 文本或包含文本的展示型子节点；嵌套的 TextShimmer 也会读取它。不要放副作用或元素 id。 */
  children: ReactNode;
  /** 是否播放动画；嵌套实例继承所在行的活动状态。 */
  active?: boolean;
  className?: string;
  /** 同时应用到基础内容与装饰副本上的布局类名。 */
  contentClassName?: string;
}

/** 标记当前子树是否处于装饰性副本中；`TextShimmer` 内部使用，导出以便自定义装饰层复用。 */
export const TextShimmerContext = DecorativeCopy;

function TextContent({ children, className }: Pick<TextShimmerProps, 'children' | 'className'>) {
  const decorative = useContext(DecorativeCopy);
  const generated = decorative === true && typeof children === 'string';
  return (
    <span
      className={clsx(css.text, className)}
      data-shimmer-text={generated ? children : undefined}
    >
      {generated ? null : children}
    </span>
  );
}

/**
 * 渲染带一条共享高亮扫光的文字，同时保留可选中、可访问的内容。
 *
 * 嵌套实例继承外层的动画状态。图标请放在外面；装饰性分隔符用
 * `data-shimmer-decoration` 标记，其背景会跟随高亮。活动状态下子节点还会渲染
 * 一份惰性、裁剪过的装饰副本，因此只应提供展示性内容。
 */
export const TextShimmer = memo(function TextShimmer({
  children,
  active = false,
  className,
  contentClassName,
}: TextShimmerProps) {
  const decorative = useContext(DecorativeCopy);
  if (decorative !== undefined) {
    return <TextContent className={className}>{children}</TextContent>;
  }
  const content = typeof children === 'string' ? <TextContent>{children}</TextContent> : children;
  return (
    <span className={clsx(css.root, className)} data-shimmer={active || undefined}>
      <DecorativeCopy.Provider value={false}>
        <span className={clsx(css.content, contentClassName)}>{content}</span>
      </DecorativeCopy.Provider>
      {active && (
        // React 19 支持布尔 inert，渲染结果与上游的空字符串写法相同（inert=""）。
        <span className={css.decoration} aria-hidden="true" inert>
          <span className={css.sweep}>
            <DecorativeCopy.Provider value={true}>
              <span className={clsx(css.content, css.highlight, contentClassName)}>{content}</span>
            </DecorativeCopy.Provider>
          </span>
        </span>
      )}
    </span>
  );
});
