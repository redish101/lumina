# Lumina

个人使用的 React 组件库。技术栈：**React 19 + TypeScript + Vite（library mode）+ CSS Modules + Storybook**，包管理使用 **pnpm**。

> 目前尚未实现任何正式组件；`Button` 只是用于演示目录结构、样式约定和文档链路的占位组件。

## 快速开始

```bash
cd lumina
pnpm install

pnpm dev           # 启动 Storybook 文档（http://localhost:6006）
pnpm build         # 构建组件库（类型检查 + 产物 + 类型声明）
```

## 常用脚本

| 命令                                | 说明                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `pnpm dev` / `pnpm docs`            | 启动 Storybook 开发服务器（端口 6006）                              |
| `pnpm docs:build`                   | 静态构建文档到 `storybook-static/`                                  |
| `pnpm docs:preview`                 | 本地预览构建好的文档                                                |
| `pnpm build`                        | `tsc -p tsconfig.build.json` 生成 `.d.ts`，再用 Vite 打包到 `dist/` |
| `pnpm typecheck`                    | 仅做类型检查（含 stories 与 Storybook 配置）                        |
| `pnpm lint`                         | ESLint（flat config，含 typescript-eslint 与 react-hooks 规则）     |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查                                              |

## 目录结构

```text
lumina/
├── .storybook/
│   ├── main.ts              # stories 匹配、addons、framework、docgen
│   └── preview.ts           # 全局样式、主题切换（data-theme）、全局 parameters
├── .vscode/                 # 推荐的编辑器配置
├── .github/workflows/ci.yml # typecheck / lint / format / build / docs:build
├── src/
│   ├── components/
│   │   └── Button/
│   │       ├── Button.tsx           # 组件实现
│   │       ├── Button.module.css    # CSS Module 样式（只用设计令牌）
│   │       ├── Button.stories.tsx   # Storybook stories（带 autodocs）
│   │       └── index.ts             # 组件出口
│   ├── intro/Introduction.mdx       # 文档首页
│   ├── styles/
│   │   ├── tokens.css               # 设计令牌（亮/暗主题变量）
│   │   ├── global.css               # 重置与基础排版
│   │   └── index.css                # 样式入口
│   └── index.ts                     # 组件库公共 API 入口
├── types/css-modules.d.ts   # CSS Modules 类型声明
├── vite.config.ts           # 库构建配置（ESM + CJS，外部化 React）
├── tsconfig.json            # 开发/编辑器用（noEmit）
├── tsconfig.build.json      # 生成类型声明用
├── eslint.config.js
├── .prettierrc.json
└── .npmrc                   # registry（npmmirror）
```

## 新增组件

1. 新建 `src/components/<Name>/`，包含 `<Name>.tsx`、`<Name>.module.css`、`<Name>.stories.tsx`、`index.ts`
2. 样式只引用 `src/styles/tokens.css` 中的 CSS 变量（例如 `var(--lumina-color-primary)`）
3. 在 `src/index.ts` 中导出组件与 Props 类型
4. 在 stories 中加上 `tags: ['autodocs']`（或在 `meta` 中设置），Storybook 会自动生成 Docs 页与 props 表格

## 构建产物

`pnpm build` 后 `dist/` 的结构：

```text
dist/
├── index.d.ts          # 公共类型入口
├── components/…/*.d.ts # 各组件的类型声明
├── lumina.js           # ESM
├── lumina.cjs          # CJS
└── style.css           # 全部 CSS Module 抽取合并而成
```

- React / React DOM 声明为 `peerDependencies`，构建时被外部化，不会打进产物
- 样式不会自动注入，使用方需要 `import 'lumina/style.css'`
- `package.json` 的 `exports` 已配置好 `types` / `import` / `require` / `./style.css`

## 关于 pnpm 的两点说明

- 项目根目录的 `pnpm-workspace.yaml` 中 `allowBuilds.esbuild: true`：pnpm 12 默认阻止依赖执行构建脚本，而 esbuild 需要它来安装平台二进制
- `minimumReleaseAgeExclude`：本机 pnpm 开启了“新版本冷却期”（新发布不足 1 天的包会被拒绝），这里放行了几个刚发布、但构建链需要的版本。等这些版本过了冷却期后，可以从该列表中删除
