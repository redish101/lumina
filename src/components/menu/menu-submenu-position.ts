/** 依据布局视口剩余空间，在「侧边子卡片」与「单面板子页面」之间做选择。 */

/** 父卡片与侧边子卡片之间的间隙，与 Menu.module.css 的 `.submenu` 一致。 */
export const SUBMENU_GAP = 4;
/** 所有 portal 菜单卡片共用的布局视口内边距。 */
export const SUBMENU_MARGIN = 12;

/**
 * 判断父卡片左右两侧是否都放不下子卡片。
 * 侧边卡片本身由 CSS 锚点定位并翻转；这个判断只决定是否改用整页布局。
 * @param parent - 父卡片在客户端坐标系中的矩形。
 * @param width - 子卡片的自然宽度。
 * @param viewportWidth - 布局视口宽度。
 * @returns 子卡片必须替换父页面时为 true。
 */
export function submenuNeedsPage(parent: DOMRect, width: number, viewportWidth: number): boolean {
  const right = parent.right + SUBMENU_GAP + width <= viewportWidth - SUBMENU_MARGIN;
  const left = parent.left - SUBMENU_GAP - width >= SUBMENU_MARGIN;
  return !right && !left;
}
