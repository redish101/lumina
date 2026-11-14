import clsx from 'clsx';
import css from './state-dot.module.css';
import { IconCheckOutline } from '../../icons';

/**
 * 状态语义：绿色完成 / 琥珀色需要用户关注 / 三级灰加载中 / 红色错误 /
 * 中性灰空闲（被跟踪对象当前没有任何进行中的活动）。
 */
export type StateDotState = 'done' | 'warning' | 'ongoing' | 'error' | 'idle';

/**
 * 把加载器的 CSS 动画固定到文档时间零点。CSS 动画在元素插入时开始，元素被移动
 * 或重新显示时重启，因此不同时刻启动的加载器会逐渐失相；共享同一起始时间可以让
 * 所有可见加载器保持同步。挂载时固定第一次启动，元素自身的 `animationstart`
 * 监听器固定每次重启。
 * @param element - 已挂载的加载器；卸载时为 null。
 */
function syncSpinner(element: SVGSVGElement | null): void {
  if (element === null) return;
  pinSpinner(element);
  element.addEventListener('animationstart', () => {
    pinSpinner(element);
  });
}

/**
 * 把加载器子树里的所有 CSS 动画设为从文档时间零点开始。
 * @param element - 已挂载的加载器。
 */
function pinSpinner(element: SVGSVGElement): void {
  // jsdom（单元测试环境）没有实现 Web Animations，尽管 lib.dom 的类型声明是非可选的；
  // 可选调用让该环境保持不同步即可。
  const spinner = element as { getAnimations?: SVGSVGElement['getAnimations'] };
  for (const animation of spinner.getAnimations?.({ subtree: true }) ?? []) animation.startTime = 0;
}

export type StateDotProps = {
  /** 显示 `done`、`warning`、`ongoing`、`error`、`idle` 中的哪一种状态 */
  state: StateDotState;
  /** 外径（px）；默认 ongoing 为 14，实心状态为 10 */
  size?: number;
  /** 追加在圆点上的类名，便于外部布局 */
  className?: string;
  /** 默认是紧凑圆点；`step` 使用实心对勾或空心待办圆圈 */
  appearance?: 'dot' | 'step';
};

/**
 * 状态圆点。
 *
 * 组件本身 `aria-hidden`；无障碍语义请与文字搭配使用。
 */
export function StateDot({ state, size, className, appearance = 'dot' }: StateDotProps) {
  const edge = size ?? (state === 'ongoing' ? 14 : 10);
  if (state === 'ongoing') {
    return (
      <svg
        ref={syncSpinner}
        className={clsx(css.spinner, className)}
        data-state="ongoing"
        width={edge}
        height={edge}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g className={css.spinnerMotion}>
          <circle className={css.spinnerTrack} cx="12" cy="12" r="9.5" />
          <circle className={css.spinnerArc} cx="12" cy="12" r="9.5" />
        </g>
      </svg>
    );
  }
  return (
    <span
      className={clsx(appearance === 'step' ? css.step : css.dot, className)}
      data-state={state}
      style={{ width: edge, height: edge }}
      aria-hidden="true"
    >
      {appearance === 'step' && state === 'done' && <IconCheckOutline size={edge - 2} />}
    </span>
  );
}
