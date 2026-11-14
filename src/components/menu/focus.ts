/** 移动设备识别与「自动聚焦不显示焦点环」。 */
const releases = new WeakMap<HTMLElement, () => void>();
const navigationKeys = new Set([
  'Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);
let mobileDevice: boolean | undefined;

/**
 * 依据当前浏览器的设备信息识别 iOS / Android 手机与平板。
 * MacIntel 且多点触控可识别桌面模式下的 iPad。
 * 首次结果在页面刷新前由所有调用方共享。
 * @returns 识别为移动设备时为 true；其它设备（包括无法识别的 UA）为 false。
 */
export function isMobileDevice(): boolean {
  if (mobileDevice !== undefined) return mobileDevice;
  const { userAgent, platform, maxTouchPoints } = navigator;
  mobileDevice =
    /Android|iPhone|iPad|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
  return mobileDevice;
}

/**
 * 聚焦自动进入的目标元素但不显示焦点环，直到键盘导航或失焦。
 * 上游由应用主题在存在 `data-dsh-automatic-focus` 时抑制 outline；本库没有主题层，
 * 等效规则补在 `menu.module.css` 里（只影响被本函数自动聚焦的元素）。
 * Tab 与方向键会恢复正常焦点样式。
 * @param element - 接收自动聚焦的控件或容器。
 * @param options - 浏览器聚焦选项，包括是否保持滚动位置。
 */
export function focusWithoutRing(element: HTMLElement, options?: FocusOptions): void {
  releases.get(element)?.();
  const release = (): void => {
    element.removeAttribute('data-dsh-automatic-focus');
    element.removeEventListener('blur', release);
    element.removeEventListener('keydown', navigate, true);
    releases.delete(element);
  };
  const navigate = (event: KeyboardEvent): void => {
    if (
      !event.isComposing &&
      !event.ctrlKey &&
      !event.altKey &&
      !event.metaKey &&
      navigationKeys.has(event.key)
    )
      release();
  };
  releases.set(element, release);
  element.setAttribute('data-dsh-automatic-focus', '');
  element.addEventListener('blur', release);
  element.addEventListener('keydown', navigate, true);
  element.focus(options);
  if (!element.matches(':focus')) release();
}
