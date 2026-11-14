'use client';

/** 包内共享的行展示，数据行、组件行与子菜单行都用它。 */
import { useId } from 'react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import type { MenuEntry, MenuItemButtonProps, MenuLabel, MenuSeparator } from './menu';
import { IconCheckOutline, IconChevronRightOutline } from '../../icons';
import { ShortcutKeys } from '../shortcut-keys';
import { Tooltip } from '../tooltip';
import css from './menu.module.css';

/** 可选且允许显式 `undefined` 的 props，便于数据行原样透传缺失的 `MenuItem` 字段。 */
type OptionalProps<T, K extends keyof T> = { [P in K]?: T[P] | undefined };

/** 包内行 props：`MenuItemButton` 的字段加上数据行 / 子级行的展示项。 */
type MenuRowProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
  Pick<MenuItemButtonProps, 'children'> &
  OptionalProps<
    MenuItemButtonProps,
    'icon' | 'shortcut' | 'current' | 'disabledReason' | 'danger' | 'separatorBefore'
  > & {
    /** 这一数据行是否是菜单当前选中项。 */
    selected?: boolean;
    /** 选中标记：行尾对勾，或整行填充。 */
    selection?: 'check' | 'fill';
    /** 保留空的图标列，让同组行保持对齐。 */
    reserveIcon?: boolean;
    /** 把图标从辅助技术中隐藏；组件行则保持可读。 */
    decorativeIcon?: boolean;
    /** 行外层容器上的指针事件，子菜单父行使用。 */
    wrapperProps?: HTMLAttributes<HTMLDivElement> | undefined;
  };

/**
 * 包内共享的菜单行，数据行、组件行与子菜单行都用它。
 *
 * 带原因的禁用行仍可获得焦点，但永远不会触发。
 */
export function MenuRow({
  children,
  icon,
  shortcut,
  current,
  disabled = false,
  disabledReason,
  danger,
  separatorBefore,
  selected,
  selection = 'check',
  reserveIcon,
  decorativeIcon = true,
  wrapperProps,
  ...button
}: MenuRowProps) {
  const reasonId = useId();
  const explained = disabled && disabledReason !== undefined;
  // 说明变化时 Tooltip 保持挂载，从而不打断按钮的焦点。
  return (
    <div {...wrapperProps} className={css.itemWrap}>
      {separatorBefore && <div className={css.separator} role="separator" />}
      <Tooltip
        label={disabledReason ?? ''}
        disabled={!explained}
        side="bottom"
        delayMs={500}
        maxWidth={300}
        portal
      >
        <button
          {...button}
          type="button"
          role="menuitem"
          className={clsx(
            css.item,
            selected && (selection === 'fill' ? css.selectedFill : css.selected),
            danger && css.danger,
          )}
          disabled={disabled && !explained}
          aria-disabled={explained || undefined}
          aria-describedby={explained ? reasonId : undefined}
          aria-keyshortcuts={shortcut?.aria}
          aria-current={current === true ? 'page' : undefined}
          onClick={explained ? undefined : button.onClick}
        >
          {(icon !== undefined || reserveIcon) && (
            <span aria-hidden={decorativeIcon || undefined} className={css.itemIcon}>
              {icon}
            </span>
          )}
          <span className={css.itemLabel}>{children}</span>
          {shortcut !== undefined && (
            <span aria-hidden="true" className={css.shortcut}>
              <ShortcutKeys keys={shortcut.keys} className={css.shortcutKeys} />
            </span>
          )}
          {selected && selection === 'check' && <IconCheckOutline className={css.check} />}
          {button['aria-haspopup'] === 'menu' && (
            <IconChevronRightOutline aria-hidden="true" className={css.check} />
          )}
        </button>
      </Tooltip>
      {explained && (
        <span id={reasonId} hidden>
          {disabledReason}
        </span>
      )}
    </div>
  );
}

/**
 * 在每个以分隔线划分的数据组内标记图标列。
 * @param entries - 一个菜单区域内的条目。
 * @param contextual - 是否对齐分组右键菜单的图标。
 * @returns 需要保留前置图标列的条目。
 */
export function menuIconColumns(
  entries: readonly MenuEntry[],
  contextual: boolean,
): ReadonlySet<MenuEntry> {
  const aligned = new Set<MenuEntry>();
  if (!contextual) return aligned;
  let group: MenuEntry[] = [];
  const finish = (): void => {
    if (group.some((entry) => !('type' in entry) && entry.icon !== undefined)) {
      for (const entry of group) aligned.add(entry);
    }
    group = [];
  };
  for (const entry of entries) {
    if ('type' in entry && entry.type === 'separator') finish();
    else group.push(entry);
  }
  finish();
  return aligned;
}

/**
 * 在键盘漫游之外渲染分隔线或分组标题。
 * @param entry - 非交互的菜单条目。
 * @returns 对应的元素。
 */
export function renderMenuDecoration(entry: MenuSeparator | MenuLabel): ReactNode {
  return entry.type === 'separator' ? (
    <div key={entry.id} className={css.separator} role="separator" />
  ) : (
    <div key={entry.id} className={css.label} role="presentation">
      {entry.text}
    </div>
  );
}
