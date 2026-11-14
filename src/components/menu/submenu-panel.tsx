'use client';

/** 子菜单卡片的 portal 呈现；交互状态归 useMenuSubmenu 所有。 */
import type { CSSProperties, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { menuHoverAllowed, type MenuSubmenu } from './use-menu-submenu';
import { menuIconColumns, MenuRow, renderMenuDecoration } from './menu-row';
import { IconChevronLeftOutline } from '../../icons';
import { MenuSurface } from './menu-surface';
import css from './menu.module.css';

/** 给父卡片锚点命名，并在布局未知时隐藏子卡片。 */
function anchors(
  parentAnchor: string,
  hidden: boolean,
): CSSProperties & Record<`--dsh-submenu-${string}`, string> {
  return {
    '--dsh-submenu-parent': parentAnchor,
    ...(hidden ? { visibility: 'hidden' } : {}),
  };
}

/**
 * 子菜单卡片的 body portal 呈现。
 *
 * 单面板布局下额外渲染一行不参与选中的返回行；交互状态归 `useMenuSubmenu` 所有。
 */
export function SubmenuPanel({
  entry,
  submenu,
  compact,
  dense,
  contextual,
  backLabel,
  onSelect,
  onClose,
  afterSelection,
}: {
  entry: NonNullable<MenuSubmenu['entry']>;
  submenu: MenuSubmenu;
  compact: boolean;
  dense: boolean;
  contextual: boolean;
  backLabel: ReactNode;
  onSelect: ((id: string) => void) | undefined;
  onClose: () => void;
  afterSelection: () => void;
}) {
  const columns = menuIconColumns(entry.submenu, contextual);
  // 单独取出用到的字段：整包传递会让 lint 把它当成在渲染期间读取 ref。
  const { panelRef, parentAnchor, hidden, measured, page, cancelClose, leave, returnToParent } =
    submenu;
  return createPortal(
    <MenuSurface
      ref={panelRef}
      compact={compact}
      className={clsx(
        css.submenu,
        css.scrollable,
        dense && css.denseList,
        compact && css.compactList,
      )}
      style={anchors(parentAnchor, hidden)}
      data-submenu-layout={measured ? (page ? 'page' : 'side') : undefined}
      data-contextual={contextual ? '' : undefined}
      role="menu"
      onPointerEnter={cancelClose}
      onPointerLeave={(event) => {
        if (menuHoverAllowed(event)) leave();
      }}
      onContextMenu={
        contextual
          ? (event) => {
              event.preventDefault();
              event.stopPropagation();
              onClose();
            }
          : undefined
      }
      onClick={(event) => {
        event.stopPropagation();
        afterSelection();
      }}
    >
      {page && (
        <>
          <MenuRow
            data-menu-back=""
            icon={<IconChevronLeftOutline className={css.check} />}
            onClick={returnToParent}
          >
            {backLabel}
          </MenuRow>
          <div className={css.separator} role="separator" />
        </>
      )}
      <div className={css.viewport} role="presentation">
        {entry.submenu.map((sub) =>
          'type' in sub ? (
            renderMenuDecoration(sub)
          ) : (
            <MenuRow
              key={sub.id}
              icon={sub.icon}
              reserveIcon={columns.has(sub)}
              disabled={sub.disabled}
              danger={sub.danger}
              shortcut={sub.shortcut}
              onClick={() => {
                onSelect?.(sub.id);
              }}
            >
              {sub.label}
            </MenuRow>
          ),
        )}
      </div>
    </MenuSurface>,
    document.body,
  );
}
