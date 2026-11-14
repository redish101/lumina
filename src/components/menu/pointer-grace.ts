'use client';

import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * 指针离开后延迟关闭浮层的宽限期。覆盖锚点与浮层之间的间隙
 * （HoverCard 是 8px，Menu 是 4px），给手部移动留出时间，
 * 又不会在指针确实离开后让浮层久留。
 */
export const POINTER_GRACE_MS = 200;

/** 可取消的延迟关闭句柄，供指针触发的浮层使用。 */
export interface PointerGrace {
  /** 从现在起 {@link POINTER_GRACE_MS} 后关闭，替换已排队的关闭。 */
  arm: () => void;
  /** 取消已排队的关闭（指针回来了）。 */
  cancel: () => void;
}

/**
 * 延迟关闭由指针离开触发的浮层，让指针有时间跨过锚点与浮层之间的间隙。
 * 组件卸载时丢弃排队中的关闭。
 * @param close - 宽限期结束且没有重新进入时执行；在触发时才读取，因此每次渲染都可以传新闭包。
 * @returns {@link PointerGrace} 句柄。
 */
export function usePointerGrace(close: () => void): PointerGrace {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef(close);
  // 句柄只在提交后（指针事件、定时器里）被调用，因此在布局阶段取最新闭包即可。
  useLayoutEffect(() => {
    closeRef.current = close;
  });

  const cancel = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const arm = useCallback(() => {
    cancel();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      closeRef.current();
    }, POINTER_GRACE_MS);
  }, [cancel]);

  useEffect(() => cancel, [cancel]);

  return { arm, cancel };
}
