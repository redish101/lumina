/**
 * CSS Modules 类型声明。
 * 默认使用 looser 的索引签名（`string`），这样在 class 名拼错时不会报错；
 * 若希望获得严格的自动补全，可安装 `typed-css-modules` 或使用
 * `vite-plugin-lib-inject-css` 等工具生成 `*.module.css.d.ts`。
 */
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

/** 全局样式（原始 CSS）：仅作为副作用引入。 */
declare module '*.css' {}
