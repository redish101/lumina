# Lumina

个人使用的 React 组件库。技术栈：**React 19 + TypeScript + CSS Modules + Storybook**，包管理使用 **pnpm**。

> 目前还没有任何组件，`src/index.ts` 是个空入口，等你写第一个组件。

## 不打包

这个库**没有构建步骤**：`package.json` 的 `exports` 直接指向 `src/index.ts`，源码（`.tsx` + `.module.css`）原样交给使用方编译。因为唯一的使用方是 Next.js，它会负责 SWC 转译、tree-shaking 和 CSS Modules 处理，库这边再打一次包只是重复劳动。

代价是：只能被「会编译 TS/TSX 的工具」消费（Next.js / Vite / webpack + babel），不能直接被 Node `require`，也不能靠 `<script>` 在浏览器里直接用。

## 快速开始

```bash
cd lumina
pnpm install

pnpm dev           # 启动 Storybook 文档（http://localhost:6006）
pnpm check         # 类型 + lint + 格式，一把梭
```

## 常用脚本

| 命令                                | 说明                                                            |
| ----------------------------------- | --------------------------------------------------------------- |
| `pnpm dev` / `pnpm docs`            | 启动 Storybook 开发服务器（端口 6006）                          |
| `pnpm docs:build`                   | 静态构建文档到 `storybook-static/`                              |
| `pnpm docs:preview`                 | 本地预览构建好的文档                                            |
| `pnpm check`                        | 依次执行 `typecheck` / `lint` / `format:check`                  |
| `pnpm typecheck`                    | 仅做类型检查（含 stories 与 Storybook 配置）                    |
| `pnpm lint`                         | ESLint（flat config，含 typescript-eslint 与 react-hooks 规则） |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查                                          |

## 目录结构

```text
lumina/
├── .storybook/
│   ├── main.ts              # stories 匹配、addons、framework、docgen、MDX 的 GFM
│   └── preview.ts           # 全局样式、主题切换（data-theme）、全局 parameters
├── .vscode/                 # 推荐的编辑器配置
├── .github/workflows/ci.yml # typecheck / lint / format / docs:build
├── src/
│   ├── components/          # 组件，一个组件一个目录
│   │   └── <Name>/
│   │       ├── <Name>.tsx          # 组件实现
│   │       ├── <Name>.module.css   # CSS Module 样式（只用设计令牌）
│   │       ├── <Name>.stories.tsx  # Storybook stories（带 autodocs）
│   │       └── index.ts            # 组件出口
│   ├── intro/Introduction.mdx       # 文档首页
│   ├── styles/
│   │   ├── tokens.css               # 设计令牌（亮/暗主题变量）
│   │   ├── global.css               # 重置与基础排版
│   │   └── index.css                # 样式入口
│   └── index.ts                     # 组件库公共 API 入口
├── types/css-modules.d.ts   # CSS Modules 类型声明
├── tsconfig.json            # 类型检查 / 编辑器用（noEmit）
├── eslint.config.js
├── .prettierrc.json
└── .npmrc                   # registry（npmmirror）
```

## 新增组件

1. 新建 `src/components/<Name>/`，包含 `<Name>.tsx`、`<Name>.module.css`、`<Name>.stories.tsx`、`index.ts`
2. 样式只引用 `src/styles/tokens.css` 中的 CSS 变量（例如 `var(--lumina-color-primary)`）
3. 在 `src/index.ts` 中导出组件与 Props 类型
4. 在 stories 中加上 `tags: ['autodocs']`（或在 `meta` 中设置），Storybook 会自动生成 Docs 页与 props 表格
5. **用了 hooks 或事件处理的组件，文件第一行写 `'use client'`**——源码会被 Next.js 直接编译，没有这一行会被当成 RSC 处理

## 在 Next.js 中使用

要求 **App Router**。Pages Router 下，依赖包里的 CSS Modules 会被 Next.js 直接拒绝（[css-modules-npm](https://nextjs.org/docs/messages/css-modules-npm)）；App Router 没有这个限制。

**方式 A：同一个 pnpm workspace（推荐，零配置）**

把 `lumina` 目录放进应用所在 workspace，然后 `"lumina": "workspace:*"`。Turbopack 会自动转译 workspace 内的包，不需要 `transpilePackages`：

```yaml
# 使用方项目的 pnpm-workspace.yaml
packages:
  - 'app'
  - 'lumina'
```

**方式 B：装成正式依赖**

打包后安装（或发布到 registry），然后在 `next.config.ts` 里显式允许 Next.js 编译它：

```bash
pnpm pack                       # 在 lumina 里生成 lumina-0.0.0.tgz
pnpm add ./lumina-0.0.0.tgz     # 在应用里安装
```

```js
// next.config.ts
const nextConfig = {
  transpilePackages: ['lumina'],
};
```

> 别用 `pnpm add ../lumina` 直接链一个裸文件夹：pnpm 只会建符号链接、不安装该目录自己的依赖，`clsx` 这类运行时依赖会解析失败；Turbopack 还解析不到工作区之外的符号链接（webpack 可以，但依赖问题照旧）。

上面两条路径都用 Next.js 16.4.6 + Turbopack 实测过：类型检查、CSS Modules、SSR 产物都正常。

然后在 `app/layout.tsx` 里引入一次全局样式：

```tsx
import 'lumina/styles.css';
```

设计令牌（`--lumina-*` 变量）随 `styles.css` 一起进来；如果只想引令牌、不要 reset，用 `import 'lumina/tokens.css'`。

## 关于 pnpm 的两点说明

- 项目根目录的 `pnpm-workspace.yaml` 中 `allowBuilds.esbuild: true`：pnpm 12 默认阻止依赖执行构建脚本，而 esbuild 需要它来安装平台二进制
- `minimumReleaseAgeExclude`：本机 pnpm 开启了“新版本冷却期”（新发布不足 1 天的包会被拒绝），这里放行了几个刚发布、但构建链需要的版本。等这些版本过了冷却期后，可以从该列表中删除
