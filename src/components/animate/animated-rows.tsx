'use client';

/** 按 key 追踪行位置的列表容器：列表增删/重排时做位移与淡入淡出。 */
import { useCallback, useLayoutEffect, useRef, type AriaRole, type ReactNode } from 'react';
import css from './animated-rows.module.css';

const ROW_FADE_MS = 100;
const ROW_GLIDE_MS = 200;
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** 列表容器：子节点是带 key 的行，行上要写 `data-row-key`。 */
export interface AnimatedRowsProps {
  children: ReactNode;
  /** 追加在列表容器上的类名 */
  className?: string;
  /** 列表的语义角色 */
  role?: AriaRole;
  /** 列表的无障碍标签 */
  label?: string;
  /** 当前渲染顺序的行 key，必须与子节点上的 `data-row-key` 一一对应 */
  rowKeys: readonly string[];
  /** 数据是否已就绪；未就绪时不做任何动画 */
  ready: boolean;
  /** 整体视图切换的标识，变化时直接定格、不做动画 */
  resetKey: string;
}

interface RowPosition {
  element: HTMLElement;
  rect: DOMRect;
  opacity: number;
  /** 退出行克隆到叠加层后要沿用的内联起始内边距 */
  paddingInlineStart: string;
}

type Viewport = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>;

interface RowSnapshot {
  viewport: Viewport;
  positions: Map<string, RowPosition>;
}

interface Exit {
  element: HTMLElement;
  animation: Animation;
}

/** `SnapshotProbe` 在 cleanup 里带回来的「上一次提交」的 props 摘要。 */
interface ProbeSnapshot {
  ready: boolean;
  rowSignature: string;
  resetKey: string;
}

function sameRows(previous: AnimatedRowsProps, next: AnimatedRowsProps): boolean {
  return (
    previous.rowKeys.length === next.rowKeys.length &&
    previous.rowKeys.every((key, index) => key === next.rowKeys[index])
  );
}

/** 用作 layout effect 的依赖：只有成员或顺序变化时才重新测量。 */
function rowsSignature(rowKeys: readonly string[]): string {
  return JSON.stringify(rowKeys);
}

function visibleViewport(list: HTMLElement): Viewport {
  const rect = list.getBoundingClientRect();
  return {
    top: Math.max(0, rect.top),
    bottom: Math.min(window.innerHeight, rect.bottom),
    left: Math.max(0, rect.left),
    right: Math.min(window.innerWidth, rect.right),
  };
}

function intersects(row: DOMRect, viewport: Viewport): boolean {
  return (
    row.bottom > viewport.top &&
    row.top < viewport.bottom &&
    row.right > viewport.left &&
    row.left < viewport.right
  );
}

function readPositions(
  list: HTMLElement,
  movements: ReadonlyMap<HTMLElement, Animation>,
  capturePadding: boolean,
): Map<string, RowPosition> {
  const rows = list.querySelectorAll<HTMLElement>('[data-row-key]');
  const positions = new Map<string, RowPosition>();
  for (const element of rows) {
    const animated = movements.has(element);
    const style = animated || capturePadding ? getComputedStyle(element) : null;
    positions.set(element.dataset.rowKey as string, {
      element,
      rect: element.getBoundingClientRect(),
      opacity: animated ? Number(style?.opacity) : 1,
      paddingInlineStart: capturePadding ? (style?.paddingInlineStart ?? '') : '',
    });
  }
  return positions;
}

function play(
  element: HTMLElement,
  keyframes: Keyframe[],
  duration: number,
  movements: Map<HTMLElement, Animation>,
): void {
  const animation = element.animate(keyframes, { duration, easing: 'ease-out' });
  movements.set(element, animation);
  animation.onfinish = () => {
    movements.delete(element);
    animation.cancel();
  };
}

function cancelMovements(movements: Map<HTMLElement, Animation>): void {
  for (const animation of movements.values()) {
    animation.onfinish = null;
    animation.cancel();
  }
  movements.clear();
}

function removeExit(exits: Map<string, Exit>, key: string): void {
  const exit = exits.get(key);
  if (exit === undefined) return;
  exit.animation.onfinish = null;
  exit.animation.cancel();
  exit.element.remove();
  exits.delete(key);
}

function clearAnimations(exits: Map<string, Exit>, movements: Map<HTMLElement, Animation>): void {
  cancelMovements(movements);
  for (const key of exits.keys()) removeExit(exits, key);
}

interface SnapshotProbeProps {
  onMeasure: (previous: ProbeSnapshot) => void;
  rowSignature: string;
  ready: boolean;
  resetKey: string;
}

/**
 * 不渲染任何 DOM 的测量探针。
 *
 * 它必须渲染在列表容器**之前**：React 在 mutation 阶段按树的顺序执行 layout
 * effect 的 cleanup，所以探针的 cleanup 会先于后面兄弟节点（列表）的 DOM 变更；
 * 组件自身的 layout cleanup 则要等它所有后代的 DOM 变更完成后才执行，测不到
 * 「变更前」的位置。依赖只有行签名、`ready`、`resetKey`：行没有变化时不测量。
 */
function SnapshotProbe({ onMeasure, rowSignature, ready, resetKey }: SnapshotProbeProps): null {
  useLayoutEffect(() => {
    const previous: ProbeSnapshot = { ready, rowSignature, resetKey };
    return () => {
      onMeasure(previous);
    };
  }, [onMeasure, rowSignature, ready, resetKey]);
  return null;
}

/**
 * 只在行的成员或顺序变化时播动画。
 *
 * 行必须在变化前后同时与列表和窗口相交才会动；首次指针或键盘操作之后才启用动画；
 * 外层需要提供一个定位容器给退出的行做叠加层。
 */
export function AnimatedRows(props: AnimatedRowsProps): ReactNode {
  const { children, className, role, label } = props;
  const listRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const armedRef = useRef(false);
  const movementsRef = useRef<Map<HTMLElement, Animation>>(new Map());
  const exitsRef = useRef<Map<string, Exit>>(new Map());
  const snapshotRef = useRef<RowSnapshot | null>(null);
  const previousPropsRef = useRef<AnimatedRowsProps | null>(null);

  // 在 DOM 变更前（探针的 cleanup）测量并缓存，等价于 getSnapshotBeforeUpdate。
  const measure = useCallback((previous: ProbeSnapshot) => {
    const list = listRef.current;
    if (
      !armedRef.current ||
      !previous.ready ||
      list === null ||
      typeof list.animate !== 'function' ||
      window.matchMedia(REDUCED_MOTION).matches
    )
      return;
    snapshotRef.current = {
      viewport: visibleViewport(list),
      positions: readPositions(list, movementsRef.current, true),
    };
  }, []);

  // 在 DOM 变更后计算并播放动画，等价于 componentDidUpdate。
  useLayoutEffect(() => {
    const previousProps = previousPropsRef.current;
    const snapshot = snapshotRef.current;
    snapshotRef.current = null;
    previousPropsRef.current = props;

    if (previousProps === null) return;

    const list = listRef.current;
    const overlay = overlayRef.current;
    if (list === null || overlay === null) return;

    const rowsChanged = !sameRows(previousProps, props);
    const resetChanged = previousProps.resetKey !== props.resetKey;
    const readyChanged = previousProps.ready !== props.ready;

    // 探针只在上面三个依赖变化时测量；`sameRows` / `resetKey` / `ready` 仍要
    // 在这里复核，因为变更前的 cleanup 拿不到新 props。
    if (snapshot === null || !rowsChanged || resetChanged || !props.ready) {
      if (rowsChanged || resetChanged || readyChanged)
        clearAnimations(exitsRef.current, movementsRef.current);
      return;
    }

    cancelMovements(movementsRef.current);
    const viewport = visibleViewport(list);
    const origin = overlay.getBoundingClientRect();
    const positions = readPositions(list, movementsRef.current, false);

    for (const [key, row] of positions) {
      removeExit(exitsRef.current, key);
      const previousRow = snapshot.positions.get(key);
      if (
        !intersects(row.rect, viewport) &&
        (previousRow === undefined || !intersects(previousRow.rect, snapshot.viewport))
      )
        continue;
      if (previousRow === undefined) {
        play(row.element, [{ opacity: 0 }, { opacity: 1 }], ROW_FADE_MS, movementsRef.current);
        continue;
      }
      const dx = previousRow.rect.left - row.rect.left;
      const dy = previousRow.rect.top - row.rect.top;
      if (dx === 0 && dy === 0 && previousRow.opacity === 1) continue;
      play(
        row.element,
        [
          {
            transform: `translate(${String(dx)}px, ${String(dy)}px)`,
            opacity: previousRow.opacity,
          },
          { transform: 'translate(0, 0)', opacity: 1 },
        ],
        ROW_GLIDE_MS,
        movementsRef.current,
      );
    }

    const nextKeys = new Set(props.rowKeys);
    for (const [key, row] of snapshot.positions) {
      if (nextKeys.has(key) || !intersects(row.rect, snapshot.viewport)) continue;
      removeExit(exitsRef.current, key);
      const element = row.element.cloneNode(true) as HTMLElement;
      element.removeAttribute('data-row-key');
      element.inert = true;
      element.style.paddingInlineStart = row.paddingInlineStart;
      Object.assign(element.style, {
        position: 'absolute',
        margin: '0',
        transform: 'none',
        boxSizing: 'border-box',
        left: `${String(row.rect.left - origin.left)}px`,
        top: `${String(row.rect.top - origin.top)}px`,
        width: `${String(row.rect.width)}px`,
        height: `${String(row.rect.height)}px`,
      });
      overlay.append(element);
      const animation = element.animate([{ opacity: row.opacity }, { opacity: 0 }], {
        duration: ROW_FADE_MS,
        easing: 'ease-out',
        fill: 'forwards',
      });
      exitsRef.current.set(key, { element, animation });
      animation.onfinish = () => {
        removeExit(exitsRef.current, key);
      };
    }
  });

  // 卸载时取消所有动画并清掉叠加层里的残留克隆。
  useLayoutEffect(() => {
    const exits = exitsRef.current;
    const movements = movementsRef.current;
    return () => {
      clearAnimations(exits, movements);
    };
  }, []);

  return (
    <>
      <SnapshotProbe
        onMeasure={measure}
        rowSignature={rowsSignature(props.rowKeys)}
        ready={props.ready}
        resetKey={props.resetKey}
      />
      <div
        ref={listRef}
        className={className}
        role={role}
        aria-label={label}
        onPointerDownCapture={() => {
          armedRef.current = true;
        }}
        onKeyDownCapture={() => {
          armedRef.current = true;
        }}
      >
        {children}
      </div>
      <div ref={overlayRef} className={css.exits} aria-hidden="true" />
    </>
  );
}
