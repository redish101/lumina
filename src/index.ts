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
export { Button } from './components/button';
export type { ButtonProps, ButtonVariant } from './components/button';
export { Input } from './components/input';
export type { InputProps } from './components/input';
