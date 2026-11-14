/**
 * Lumina 组件库入口。
 *
 * 约定：
 * - 每个组件一个目录：`src/components/<Name>/{<Name>.tsx, <Name>.module.css, <Name>.stories.tsx, index.ts}`
 * - 这里按字母顺序导出所有公共 API，构建时由 vite-plugin-dts 生成 `dist/index.d.ts`
 * - 样式文件不会被打包进 JS 自动注入，使用方需自行 `import 'lumina/style.css'`
 */
export { Button } from './components/Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './components/Button';
