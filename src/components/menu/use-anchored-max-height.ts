'use client';

/**
 * 底部锚定的浮层（slash menu、popupSelect）的视口适配 hook：
 * 元素的下边缘独立于高度参与布局，因此它向上生长、只有上边缘可能与视口相撞——
 * 把设计上限收紧到「该边缘到视口顶部」之间的空间。
 */
import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

/**
 * 浮层与视口顶部之间保留的安全距离（对齐 Menu portal 的 12px 边距）。
 *
 * 上游还会读取应用外壳的 `--dsh-frame-overlay-top`（桌面窗口顶部预留）把留白抬高，
 * 并在解析失败时退回调用方的 `margin`；本库没有那层外壳，该变量恒为空，
 * 因此上游始终走兜底分支，这里直接使用 `margin`。
 */
const MARGIN = 12;

/**
 * 把底部锚定浮层的 max-height 收紧到视口内。
 * @param ref - 浮层元素；current 为 null（浮层关闭）时跳过测量。
 * @param cap - 设计上的最大高度（px），收紧结果不会超过它。
 * @param signal - 重新测量的触发值：传入浮层的渲染状态，锚点移动（输入框增高）时重新适配；
 *   挂载期间 resize / scroll 也会重新适配。
 * @param margin - 视口顶部留白下限（px）。
 * @returns 需要内联应用的 max-height（px）。
 */
export function useAnchoredMaxHeight(
  ref: RefObject<HTMLElement | null>,
  cap: number,
  signal: unknown,
  margin: number = MARGIN,
): number {
  const [maxHeight, setMaxHeight] = useState(cap);
  useLayoutEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const fit = () => {
      setMaxHeight(Math.min(cap, Math.max(0, el.getBoundingClientRect().bottom - margin)));
    };
    fit();
    window.addEventListener('resize', fit);
    window.addEventListener('scroll', fit, true);
    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('scroll', fit, true);
    };
  }, [ref, cap, signal, margin]);
  return maxHeight;
}
