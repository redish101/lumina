/**
 * Lumina 公共 API 入口。
 *
 * 这里**故意不写** `'use client'`：指令写在每个组件文件自己身上，纯展示组件
 * （Tag / StateDot / ShortcutKeys / PathLabel 等）就没有指令，使用方在 Server
 * Component 里直接渲染它们时不会下发任何 JS；交互组件各自声明，自动成为客户端边界。
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
// 重置样式（styles/reset.css）不在这里引入：它会改动全局排版，
// 由使用方按需 `import '@redish101/lumina/reset.css'`。
import './styles/tokens.css';

export { Accordion } from './components/accordion';
export type { AccordionItem, AccordionProps } from './components/accordion';

export { AnimatedRows } from './components/animate';
export type { AnimatedRowsProps } from './components/animate';

export { Button } from './components/button';
export type { ButtonProps, ButtonVariant } from './components/button';

export { Card } from './components/card';
export type { CardPadding, CardProps } from './components/card';

export { Checkbox } from './components/checkbox';
export type { CheckboxProps } from './components/checkbox';

export { CodeCard } from './components/code-card';
export type { CodeCardProps } from './components/code-card';

export { CommandText } from './components/command-text';
export type { CommandTextProps } from './components/command-text';

export { Dialog } from './components/dialog';
export type { DialogProps, DialogSize } from './components/dialog';

export { DiffBlock } from './components/diff-block';
export type { DiffBlockLabels, DiffBlockProps, DiffHunk } from './components/diff-block';

export { DisclosureRow } from './components/disclosure-row';
export type { DisclosureRowProps } from './components/disclosure-row';

export { Empty } from './components/empty';
export type { EmptyProps, EmptySize } from './components/empty';

export { Field, useFieldControl } from './components/field';
export type { FieldControlA11y, FieldProps } from './components/field';

export { FieldGroup } from './components/field-group';
export type { FieldGroupProps } from './components/field-group';

export { FoldToggle } from './components/fold-toggle';
export type { FoldToggleLabels, FoldToggleProps } from './components/fold-toggle';

export { FormError } from './components/form-error';
export type { FormErrorProps } from './components/form-error';

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

export { JsonTree } from './components/json-tree';
export type { JsonTreeProps } from './components/json-tree';

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

export { PathLabel } from './components/path-label';
export type { PathLabelProps } from './components/path-label';

export { Pill } from './components/pill';
export type { PillProps } from './components/pill';

export { Popover } from './components/popover';
export type { PopoverAlign, PopoverProps, PopoverSide } from './components/popover';

export { RadioGroup } from './components/radio-group';
export type { RadioGroupOption, RadioGroupProps } from './components/radio-group';

export { SegmentedControl, SegmentedTabs } from './components/segmented';
export type {
  SegmentedControlOption,
  SegmentedControlProps,
  SegmentedTab,
  SegmentedTabsProps,
} from './components/segmented';

export { Select } from './components/select';
export type { SelectOption, SelectProps } from './components/select';

export { ShortcutKeys } from './components/shortcut-keys';
export type { ShortcutKeysProps } from './components/shortcut-keys';

export { Sidebar } from './components/sidebar';
export type { SidebarItem, SidebarProps, SidebarSection } from './components/sidebar';

export { StateDot } from './components/state-dot';
export type { StateDotProps, StateDotState } from './components/state-dot';

export { Switch } from './components/switch';
export type { SwitchProps } from './components/switch';

export { Tabs } from './components/tabs';
export type { TabItem, TabsProps, TabsVariant } from './components/tabs';

export { Tag } from './components/tag';
export type { TagProps, TagTone } from './components/tag';

export { TerminalBlock } from './components/terminal-block';
export type { TerminalBlockLabels, TerminalBlockProps } from './components/terminal-block';

export { TextShimmer, TextShimmerContext } from './components/text-shimmer';
export type { TextShimmerProps } from './components/text-shimmer';

export { Textarea } from './components/textarea';
export type { TextareaProps } from './components/textarea';

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
