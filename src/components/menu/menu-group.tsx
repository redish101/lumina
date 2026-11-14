'use client';

/** 可访问的菜单分组：共享的粘性标题样式，加上视口观察。 */
import { useId, type ReactNode } from 'react';
import css from './menu-group.module.css';

/**
 * 菜单里带粘性标题的可访问分组。
 *
 * 标题 id 由组件实例持有，并通过 `aria-labelledby` 命名整个分组。
 */
export function MenuGroup({ label, children }: { label: string; children?: ReactNode }) {
  const headingId = useId();
  return (
    <section role="group" aria-labelledby={headingId} data-menu-group="" className={css.group}>
      <span aria-hidden="true" data-menu-group-start="" className={css.start} />
      <div id={headingId} data-menu-group-heading="" className={css.heading}>
        {label}
      </div>
      {children}
    </section>
  );
}

/**
 * 依据原生 intersection 与视口尺寸观察，异步更新标题背景。
 * 观测确认某个 section 越过视口顶部之前，标题保持透明。
 * 没有 IntersectionObserver 或 ResizeObserver 时，CSS 粘性标题保持透明。
 * 分组成员在建立观察时确定；要观察已改动的分组或同一个视口，先 dispose。
 * @param viewport - 无 padding、无边框的滚动容器，直接子元素是 MenuGroup。
 * @returns 同时持有两个 intersection 观察者与视口尺寸观察者的清理函数：
 *   断开它们、忽略排队中的回调，并清掉由本函数管理的 data-stuck 属性。没有有效分组时不建立任何观察。
 */
export function observeStickyMenuGroups(viewport: HTMLElement): () => void {
  const groups = [...viewport.querySelectorAll<HTMLElement>(':scope > [data-menu-group]')].flatMap(
    (section) => {
      const heading = section.querySelector<HTMLElement>(':scope > [data-menu-group-heading]');
      const start = section.querySelector<HTMLElement>(':scope > [data-menu-group-start]');
      return heading === null || start === null
        ? []
        : [
            {
              section,
              heading,
              start,
              atTop: false,
              above: false,
              topTime: -Infinity,
              aboveTime: -Infinity,
            },
          ];
    },
  );
  if (
    groups.length === 0 ||
    typeof IntersectionObserver === 'undefined' ||
    typeof ResizeObserver === 'undefined'
  ) {
    return () => {};
  }

  const sections = new Map<Element, (typeof groups)[number]>(
    groups.map((group) => [group.section, group]),
  );
  const starts = new Map<Element, (typeof groups)[number]>(
    groups.map((group) => [group.start, group]),
  );
  let disposed = false;
  let stripObserver: IntersectionObserver | undefined;
  let viewportHeight: number | undefined;
  const render = (group: (typeof groups)[number]): void => {
    const stuck = group.atTop && group.above;
    if (group.heading.hasAttribute('data-stuck') !== stuck) {
      group.heading.toggleAttribute('data-stuck', stuck);
    }
  };
  const startObserver = new IntersectionObserver(
    (entries) => {
      if (disposed) return;
      for (const entry of entries) {
        const group = starts.get(entry.target);
        if (!group || entry.rootBounds === null || entry.time < group.aboveTime) continue;
        group.above = entry.boundingClientRect.top < entry.rootBounds.top;
        group.aboveTime = entry.time;
        render(group);
      }
    },
    { root: viewport, threshold: [0, 1] },
  );
  for (const { start } of groups) startObserver.observe(start);

  const sizeObserver = new ResizeObserver((entries) => {
    if (disposed) return;
    for (const entry of entries) {
      if (entry.target !== viewport || entry.contentRect.height === viewportHeight) continue;
      viewportHeight = entry.contentRect.height;
      stripObserver?.disconnect();
      // 整个 section 穿过这条细带时也能被观察到，即使滚动跳过了它的起点哨兵。
      const observer = new IntersectionObserver(
        (intersections) => {
          if (disposed || stripObserver !== observer) return;
          for (const intersection of intersections) {
            const group = sections.get(intersection.target);
            if (!group || intersection.rootBounds === null) continue;
            const top = intersection.rootBounds.top;
            if (intersection.time >= group.topTime) {
              group.atTop =
                intersection.isIntersecting && intersection.boundingClientRect.bottom > top;
              group.topTime = intersection.time;
            }
            // 两个观察者描述的都是 section 在正常流中的起点；最新样本胜出。
            if (intersection.time >= group.aboveTime) {
              group.above = intersection.boundingClientRect.top < top;
              group.aboveTime = intersection.time;
            }
            render(group);
          }
        },
        {
          root: viewport,
          rootMargin: `0px 0px ${Math.min(1, viewportHeight) - viewportHeight}px 0px`,
          threshold: 0,
        },
      );
      stripObserver = observer;
      for (const { section } of groups) observer.observe(section);
    }
  });
  sizeObserver.observe(viewport);
  return () => {
    if (disposed) return;
    disposed = true;
    startObserver.disconnect();
    stripObserver?.disconnect();
    sizeObserver.disconnect();
    for (const { heading } of groups) {
      if (heading.hasAttribute('data-stuck')) heading.removeAttribute('data-stuck');
    }
  };
}
