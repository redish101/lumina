'use client';

/**
 * Lumina 公共 API 入口。
 *
 * 构建产物为 `dist/`：ESM 分包（`preserveModules`）+ 每包自带 CSS 导入 +
 * 类型声明。使用方 `import { Button } from 'lumina'` 即可，未用到的组件连同
 * 它们的 CSS 都会被 tree-shaking 掉。
 *
 * 新增组件时在这里按字母顺序导出，例如：
 *
 * ```ts
 * export { Button } from './components/button';
 * export type { ButtonProps } from './components/button';
 * ```
 */
// 设计令牌与派生变量：任何组件都依赖它们，所以由入口统一带出。
// 全局重置（styles/global.css）不在这里引入，留给使用方决定。
import './styles/tokens.css';
import './styles/primitives.css';

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
