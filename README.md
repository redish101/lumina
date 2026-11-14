# Lumina

个人使用的 React 组件库。技术栈：**React 19 + TypeScript + CSS Modules + Vite（库构建）+ Storybook**，包管理使用 **pnpm**。

> 组件：Button、Input、Checkbox、Switch、SegmentedControl、SegmentedTabs、ShortcutKeys、Pill、Tag、StateDot、TextShimmer、AnimatedRows、Menu、Tooltip、Toast、ImagePreview、ImageLightbox、DraggableImage。每个组件在 Storybook 里都有 Docs 页与若干 story。
>
> 在线文档：<https://redish101.github.io/lumina/>

## 构建产物

`pnpm build` 用 Vite 的库模式产出 `dist/`，使用方装的是编译好的 ESM，不再需要 `transpilePackages`：

- **按模块分包**：`rollupOptions.output.preserveModules` 保留 `src/` 的模块粒度，`import { Button } from '@redish101/lumina'` 只会把 Button 及其依赖打进产物
- **样式随组件走**：`cssCodeSplit: true` + `vite-plugin-lib-inject-css`，每个 chunk 顶部自动 `import './xxx.css'`，用到哪个组件才加载哪份样式
- **类型**：`vite-plugin-dts` 按源码结构输出 `dist/**/*.d.ts`
- **设计令牌**：入口 `src/index.ts` 引入 `styles/tokens.css`，所以任意组件生效时令牌一定在场（约 34 kB，不会被 tree-shake）
- **全局重置**不自动注入，需要时 `import '@redish101/lumina/reset.css'`

三个实现细节值得记住，改配置时别踩回去：

1. Vite 的 lib 模式默认 `cssCodeSplit: false`（所有样式合并成一个文件），必须显式打开
2. 产物 CSS 是从 `*.module.css` 编译来的普通 CSS，构建时把 `.module` 后缀去掉重命名，否则使用方的 bundler 会再当 CSS Module 编译一遍
3. `package.json` 的 `sideEffects` 必须同时包含 `./dist/index.js` 和 `**/*.css`：前者保证入口里的令牌导入不被整块删掉，后者保证组件 CSS 被视为副作用

## 客户端边界

入口 `src/index.ts` **没有** `'use client'`：指令写在需要的组件文件自己身上，谁交互谁负责。

| 类型       | 例子                        | 指令 | 在 Server Component 里直接用 |
| ---------- | --------------------------- | ---- | ---------------------------- |
| 纯展示     | Tag、StateDot、ShortcutKeys | 无   | 可以，**不下发任何 JS**      |
| 交互       | Button、Input、Menu、Toast… | 有   | 可以，自动成为客户端边界     |
| 指令仓库级 | 入口 barrel                 | 无   | 导入本身不制造边界           |

漏写指令的症状是使用方 SSR 时 `Cannot read properties of null (reading 'useContext')`。`pnpm check:use-client` 会扫描 `src/**/*.tsx`：用了 hooks / `forwardRef` / 事件处理的必须带指令，没用到的则会被提示去掉（让它留在服务端）。

## 快速开始

```bash
cd lumina
pnpm install

pnpm dev           # 启动 Storybook 文档（http://localhost:6006）
pnpm check         # 类型 + lint + 格式，一把梭
pnpm build         # 产出 dist/
```

## 常用脚本

| 命令                                | 说明                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `pnpm build`                        | 构建组件库到 `dist/`（ESM + CSS + 类型声明）                        |
| `pnpm dev` / `pnpm docs`            | 启动 Storybook 开发服务器（端口 6006）                              |
| `pnpm docs:build`                   | 静态构建文档到 `storybook-static/`                                  |
| `pnpm docs:preview`                 | 本地预览构建好的文档                                                |
| `pnpm check`                        | 依次执行 `typecheck` / `lint` / `format:check` / `check:use-client` |
| `pnpm typecheck`                    | 仅做类型检查（含 stories 与 Storybook 配置）                        |
| `pnpm lint`                         | ESLint（flat config，含 typescript-eslint 与 react-hooks 规则）     |
| `pnpm check:use-client`             | 校验 `'use client'` 指令位置                                        |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查                                              |

## 目录结构

```text
lumina/
├── .storybook/
│   ├── main.ts              # stories 匹配、addons、framework、docgen、MDX 的 GFM
│   ├── preview.ts           # 全局样式、主题工具栏、全局 parameters
│   └── decorators.tsx       # 主题切换：往 body 写 data-lumina-dark-theme
├── .vscode/                 # 推荐的编辑器配置
├── .github/workflows/ci.yml # typecheck / lint / format / build / docs:build
├── src/
│   ├── components/          # 组件，一个组件一个目录（文件名 kebab-case）
│   │   ├── <name>/
│   │   │   ├── <name>.tsx          # 组件实现
│   │   │   ├── <name>.module.css   # CSS Module 样式（只用设计令牌）
│   │   │   ├── <name>.stories.tsx  # Storybook stories（带 autodocs）
│   │   │   └── index.tsx           # 组件出口
│   │   ├── menu/                   # 多文件组件：组件 + hook + 工具函数同目录
│   │   └── segmented/              # 同目录多个相关组件（Control + Tabs）
│   ├── icons/                       # 内联 SVG 图标（无指令，可在服务端渲染）
│   ├── intro/Introduction.mdx       # 文档首页
│   ├── styles/
│   │   ├── tokens.css               # 设计令牌（亮/暗主题变量、elevation）
│   │   ├── global.css               # 重置与基础排版（对外是 @redish101/lumina/reset.css）
│   │   └── index.css                # Storybook 用的样式入口（tokens → global）
│   └── index.ts                     # 公共 API 入口（导入令牌，不带 `'use client'`）
├── dist/                    # 构建产物（不提交）
├── scripts/check-use-client.mjs  # 校验 'use client' 指令位置
├── types/css-modules.d.ts   # CSS Modules 类型声明
├── vite.lib.config.ts       # 库构建配置（Storybook 不吃这份）
├── tsconfig.json            # 类型检查 / 编辑器用（noEmit）
├── tsconfig.build.json      # 生成类型声明用
├── eslint.config.js
├── .prettierrc.json
└── .npmrc                   # registry（npmmirror）
```

## 新增组件

1. 新建 `src/components/<name>/`（kebab-case），包含 `<name>.tsx`、`<name>.module.css`、`<name>.stories.tsx`、`index.tsx`
2. 样式只引用 `src/styles/tokens.css` 里的 CSS 变量（例如 `var(--lumina-alias-label-primary)`），确实缺的变量补进 `tokens.css` 的 `:root` 与暗色块
3. 在 `src/index.ts` 中导出组件与 Props 类型
4. 在 stories 中加上 `tags: ['autodocs']`（或在 `meta` 中设置），Storybook 会自动生成 Docs 页与 props 表格
5. **用了 hooks / `forwardRef` / 事件处理才写 `'use client'`**：构建不会替你补，缺了它 Next.js 会当成 RSC 处理；反过来纯展示组件不要写，才能留在服务端
6. 跑 `pnpm check:use-client` 与 `pnpm build`，确认指令位置正确、新组件的 CSS 与 `.d.ts` 出现在 `dist/` 里

## 在应用里使用

```bash
pnpm add lumina          # 或从私有 registry 安装，见下一节
```

```tsx
// app/layout.tsx
import '@redish101/lumina/reset.css'; // 可选：需要库自带的重置时
import { Button } from '@redish101/lumina';

export default function Page() {
  return <Button variant="primary">你好</Button>;
}
```

- 组件样式（CSS Modules）和设计令牌由 `import { … } from '@redish101/lumina'` 自动带出，不需要额外的 CSS 入口
- Tag / StateDot / ShortcutKeys 可以在 Server Component 里直接渲染，不下发 JS；交互组件自动成为客户端边界，无需手写 `'use client'`
- **不需要** `transpilePackages`：产物已经是编译好的 JS + CSS
- 只引令牌、不要 reset：`import '@redish101/lumina/tokens.css'`
- 本包是纯 ESM，Node 侧 `require('@redish101/lumina')` 不可用（`import` 正常）

Next.js 要求 **App Router**：Pages Router 不允许依赖包内出现 CSS Modules，构建产物里的 CSS 是普通 `.css` 文件，也不建议让 Pages Router 处理。

## 文档部署

Storybook 静态产物由 [.github/workflows/pages.yml](.github/workflows/pages.yml) 发布到 GitHub Pages：推到 `main`（或手动 `workflow_dispatch`）后构建 `storybook-static/` 并上传。

一次性准备：仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**（不要选 “Deploy from a branch”）。之后每次推 `main` 都会更新 <https://redish101.github.io/lumina/>。

产物里所有资源都是相对路径（`./assets/...`），所以直接放在 `/lumina/` 子路径下即可，不需要配 `base`；构建后补了一个 `.nojekyll`，避免 Pages 的 Jekyll 处理忽略特殊文件。

## 发布

包名 `@redish101/lumina`，发布到**官方 npm registry**。发布由 tag 触发，见 [.github/workflows/release.yml](.github/workflows/release.yml)：

```bash
pnpm version patch        # 或 minor / major，同时打 vX.Y.Z tag
git push --follow-tags    # 推送 tag → CI 自动 check / build / publish / 创建 GitHub Release
```

工作流会：

1. 校验 `GITHUB_REF_NAME`（去掉 `v`）与 `package.json` 的 `version` 一致，不一致直接失败
2. 跑 `pnpm check` 与 `pnpm build`，确认 `dist/index.js`、`dist/index.d.ts`、两个 CSS 都在
3. `npm publish --access public --tag <latest|next> --registry https://registry.npmjs.org --provenance`
4. 用 `generate_release_notes` 建一个 GitHub Release

认证走 **Trusted Publishing（OIDC）**，不需要 `NPM_TOKEN`：workflow 只有 `id-token: write` 权限，npm CLI（≥ 11.5.1）检测到 GitHub Actions 的 OIDC 环境后自己换短期凭据，并顺带产出 provenance。

一次性准备（顺序不能反）：

1. **先手动发一次**，让包在 npm 上存在：

   ```bash
   npm login                                      # npm login 现在给的是 2 小时会话，够用
   npm publish --access public                    # 走 publishConfig 里的 registry
   ```

2. 打开 <https://www.npmjs.com/package/@redish101/lumina> → **Settings → Trusted Publisher → Add**，填：
   - Publisher：GitHub Actions
   - Organization or user：`redish101`
   - Repository：`lumina`
   - Workflow filename：`release.yml`（只填文件名，要带 `.yml`）
   - Allowed actions：勾上 **Allow npm publish**
3. 之后打 tag 就全自动，且再也不用换 token。

两个注意点：

- 仓库里的 `.npmrc` 指向 npmmirror 只是为了本地安装快，`publishConfig.registry` 与工作流里的 `--registry` 会强制走官方源，不会被它带偏
- 仓库需要是公开的：npm 的 provenance 与 Trusted Publisher 都要求公开仓库；`repository` 字段要与实际仓库一致，否则 provenance 校验和安装页脚链接都会出问题

## 关于 pnpm 的两点说明

- 项目根目录的 `pnpm-workspace.yaml` 中 `allowBuilds.esbuild: true`：pnpm 12 默认阻止依赖执行构建脚本，而 esbuild 需要它来安装平台二进制
- `minimumReleaseAgeExclude`：本机 pnpm 开启了“新版本冷却期”（新发布不足 1 天的包会被拒绝），这里放行了几个刚发布、但构建链需要的版本。等这些版本过了冷却期后，可以从该列表中删除
