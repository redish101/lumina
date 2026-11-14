'use client';

/** 按 key 追踪行位置的列表容器：列表增删/重排时做位移与淡入淡出。 */
import { Component, createRef, type AriaRole, type ReactNode } from 'react';
import css from './animated-rows.module.css';

const ROW_FADE_MS = 100;
const ROW_GLIDE_MS = 200;

/** 列表容器：子节点是带 key 的行，行上要写 `data-row-key`。 */
export interface AnimatedRowsProps {
  children: ReactNode;
  /** 追加在列表容器上的类名 */
  className: string;
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
}

type Viewport = Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>;

interface RowSnapshot {
  viewport: Viewport;
  positions: Map<string, RowPosition>;
  removed: Map<string, RowPosition>;
}

function sameRows(previous: AnimatedRowsProps, next: AnimatedRowsProps): boolean {
  return (
    previous.rowKeys.length === next.rowKeys.length &&
    previous.rowKeys.every((key, index) => key === next.rowKeys[index])
  );
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

/**
 * 只在行的成员或顺序变化时播动画。
 *
 * 行必须在变化前后同时与列表和窗口相交才会动；首次指针或键盘操作之后才启用动画；
 * 外层需要提供一个定位容器给退出的行做叠加层。
 */
export class AnimatedRows extends Component<AnimatedRowsProps> {
  private armed = false;
  private readonly list = createRef<HTMLDivElement>();
  private readonly overlay = createRef<HTMLDivElement>();
  private readonly movements = new Map<HTMLElement, Animation>();
  private readonly exits = new Map<string, { element: HTMLElement; animation: Animation }>();

  override getSnapshotBeforeUpdate(previous: AnimatedRowsProps): RowSnapshot | null {
    const list = this.list.current;
    if (
      !this.armed ||
      sameRows(previous, this.props) ||
      previous.resetKey !== this.props.resetKey ||
      !previous.ready ||
      !this.props.ready ||
      list === null ||
      typeof list.animate !== 'function' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return null;

    const viewport = visibleViewport(list);
    const positions = this.readPositions();
    const nextKeys = new Set(this.props.rowKeys);
    const removed = new Map<string, RowPosition>();
    for (const [key, row] of positions) {
      if (nextKeys.has(key) || !intersects(row.rect, viewport)) continue;
      const clone = row.element.cloneNode(true) as HTMLElement;
      clone.removeAttribute('data-row-key');
      clone.inert = true;
      clone.style.paddingInlineStart = getComputedStyle(row.element).paddingInlineStart;
      removed.set(key, { ...row, element: clone });
    }
    return { viewport, positions, removed };
  }

  override componentDidUpdate(
    previous: AnimatedRowsProps,
    _state: unknown,
    snapshot: RowSnapshot | null,
  ): void {
    if (snapshot === null) {
      if (
        !sameRows(previous, this.props) ||
        previous.resetKey !== this.props.resetKey ||
        previous.ready !== this.props.ready
      )
        this.clear();
      return;
    }

    this.cancelMovements();
    const list = this.list.current as HTMLDivElement;
    const overlay = this.overlay.current as HTMLDivElement;
    const viewport = visibleViewport(list);
    const origin = overlay.getBoundingClientRect();
    const positions = this.readPositions();

    for (const [key, row] of positions) {
      this.removeExit(key);
      const previousRow = snapshot.positions.get(key);
      if (
        !intersects(row.rect, viewport) &&
        (previousRow === undefined || !intersects(previousRow.rect, snapshot.viewport))
      )
        continue;
      if (previousRow === undefined) {
        this.move(row.element, [{ opacity: 0 }, { opacity: 1 }], ROW_FADE_MS);
        continue;
      }
      const dx = previousRow.rect.left - row.rect.left;
      const dy = previousRow.rect.top - row.rect.top;
      if (dx === 0 && dy === 0 && previousRow.opacity === 1) continue;
      this.move(
        row.element,
        [
          {
            transform: `translate(${String(dx)}px, ${String(dy)}px)`,
            opacity: previousRow.opacity,
          },
          { transform: 'translate(0, 0)', opacity: 1 },
        ],
        ROW_GLIDE_MS,
      );
    }

    for (const [key, row] of snapshot.removed) {
      const { element } = row;
      this.removeExit(key);
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
      this.exits.set(key, { element, animation });
      animation.onfinish = () => {
        this.removeExit(key);
      };
    }
  }

  override componentWillUnmount(): void {
    this.clear();
  }

  private readPositions(): Map<string, RowPosition> {
    const list = this.list.current as HTMLDivElement;
    const rows = list.querySelectorAll<HTMLElement>('[data-row-key]');
    return new Map(
      Array.from(rows, (element) => [
        element.dataset.rowKey as string,
        {
          element,
          rect: element.getBoundingClientRect(),
          opacity: this.movements.has(element) ? Number(getComputedStyle(element).opacity) : 1,
        },
      ]),
    );
  }

  private move(element: HTMLElement, keyframes: Keyframe[], duration: number): void {
    const animation = element.animate(keyframes, { duration, easing: 'ease-out' });
    this.movements.set(element, animation);
    animation.onfinish = () => {
      this.movements.delete(element);
      animation.cancel();
    };
  }

  private cancelMovements(): void {
    for (const animation of this.movements.values()) {
      animation.onfinish = null;
      animation.cancel();
    }
    this.movements.clear();
  }

  private removeExit(key: string): void {
    const exit = this.exits.get(key);
    if (exit === undefined) return;
    exit.animation.onfinish = null;
    exit.animation.cancel();
    exit.element.remove();
    this.exits.delete(key);
  }

  private clear(): void {
    this.cancelMovements();
    for (const key of this.exits.keys()) this.removeExit(key);
  }

  override render(): ReactNode {
    return (
      <>
        <div
          ref={this.list}
          className={this.props.className}
          role={this.props.role}
          aria-label={this.props.label}
          onPointerDownCapture={() => {
            this.armed = true;
          }}
          onKeyDownCapture={() => {
            this.armed = true;
          }}
        >
          {this.props.children}
        </div>
        <div ref={this.overlay} className={css.exits} aria-hidden="true" />
      </>
    );
  }
}
