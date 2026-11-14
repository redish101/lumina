/**
 * Lumina 公共 API 入口。
 *
 * 本包**不产出构建产物**：`package.json` 的 `exports` 直接指向这个文件，
 * 由使用方（Next.js）在自己的编译流程里处理 TSX 与 CSS Modules。
 *
 * 新增组件时在这里按字母顺序导出，例如：
 *
 * ```ts
 * export { Button } from './components/button';
 * export type { ButtonProps } from './components/button';
 * ```
 *
 * 样式入口是 `src/styles/index.css`，对外暴露为 `lumina/styles.css`。
 */
export { AnimatedRows } from './components/animate';
export type { AnimatedRowsProps } from './components/animate';

export { Button } from './components/button';
export type { ButtonProps, ButtonVariant } from './components/button';

export { Checkbox } from './components/checkbox';
export type { CheckboxProps } from './components/checkbox';

export { DraggableImage, ImageLightbox, ImagePreview } from './components/image';
export type {
  DraggableImageProps,
  DragFileName,
  FileDragActions,
  FileDragSource,
  ImageLightboxLabels,
  ImageLightboxProps,
  ImagePreviewProps,
  PreparedFileDrag,
} from './components/image';

export { Input } from './components/input';
export type { InputProps } from './components/input';

export {
  Menu,
  MenuGroup,
  MenuItemButton,
  MenuRow,
  MenuSurface,
  SubmenuPanel,
} from './components/menu';
export type {
  MenuEntry,
  MenuItem,
  MenuItemButtonProps,
  MenuLabel,
  MenuProps,
  MenuSeparator,
  MenuSurfaceProps,
} from './components/menu';

export { Pill } from './components/pill';
export type { PillProps } from './components/pill';

export { SegmentedControl, SegmentedTabs } from './components/segmented';
export type {
  SegmentedControlOption,
  SegmentedControlProps,
  SegmentedTab,
  SegmentedTabsProps,
} from './components/segmented';

export { ShortcutKeys } from './components/shortcut-keys';
export type { ShortcutKeysProps } from './components/shortcut-keys';

export { StateDot } from './components/state-dot';
export type { StateDotProps, StateDotState } from './components/state-dot';

export { Switch } from './components/switch';
export type { SwitchProps } from './components/switch';

export { Tag } from './components/tag';
export type { TagProps, TagTone } from './components/tag';

export { TextShimmer, TextShimmerContext } from './components/text-shimmer';
export type { TextShimmerProps } from './components/text-shimmer';

export { Toast } from './components/toast';
export type { ToastAction, ToastProps, ToastTone } from './components/toast';

export { Tooltip, TooltipSuppression } from './components/tooltip';
export type { TooltipLabel, TooltipProps, TooltipSide } from './components/tooltip';

export {
  IconCheckCircleOutline,
  IconCheckOutline,
  IconChevronDownOutline,
  IconChevronLeftOutline,
  IconChevronRightOutline,
  IconCloseOutline,
  IconLoadingOutline,
  IconPlusOutline,
} from './icons';
export type { IconProps } from './icons';
