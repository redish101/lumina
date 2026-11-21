# 迁移说明

## 0.2.0

这一版以「把债还清」为目标，三处破坏性变更，都是机械替换；另有一处视觉尺寸调整（表单控件统一 36px 高，与 `Button` 的 `md` 对齐）。

### 1. 组件目录出口从 `index.tsx` 改成 `index.ts`

19 个组件目录的 `index.tsx` 全部改名为 `index.ts`。它们本来就只做 re-export，没有 JSX。

**影响**：只影响直接深链到文件的使用方；`import { Button } from '@redish101/lumina'` 不受影响。

### 2. `AnimatedRows` 改为函数组件，去掉 ref 命令式 API

内部从 class 的 `getSnapshotBeforeUpdate` 改为 `useLayoutEffect` 的 FLIP 实现。

**影响**：props 完全不变；如果你用过 `ref` 上的命令式方法，需要改成通过 props 驱动（组件本身也不再暴露 ref）。

### 3. 重置样式换成 `reset.css`

`src/styles/global.css` 删除，改为 `src/styles/reset.css`；对外入口名不变，仍是：

```css
@import '@redish101/lumina/reset.css';
```

**影响**：新的 reset 全部包在 `@layer lumina.reset` 与 `:where()` 里，特异性为 0，任何你自己的样式都能直接覆盖它；同时覆盖范围扩大到移动端（触摸高亮、字号自动放大、表单 `appearance`、图片基线空隙、`[hidden]`、`dialog` 默认样式、`prefers-reduced-motion`）。

如果你的项目此前依赖旧 reset 的「强重置」行为（例如依赖 `body` 的字体被强制成 Inter），现在需要自己在应用里声明一次字体族。

### 4. 构建产物新增体检

`pnpm build` 结束后会跑 `scripts/check-dist.mjs`：校验没有残留 `.module.css`、入口/令牌/重置文件齐全、`dist/utils` 之类内部目录没有泄漏。这项只是构建期校验，不影响使用方。

### 5. 脚本调整

- `pnpm docs` 删除（与 `pnpm dev` 完全重复）
- `pnpm docs:preview` 改用 `sirv` 伺服 `storybook-static/`
- 新增 `pnpm clean`

## 0.1.1

- 包名 `@redish101/lumina`，发布走 Trusted Publishing（OIDC），不再需要 `NPM_TOKEN`

## 0.1.0

首个发布版本。
