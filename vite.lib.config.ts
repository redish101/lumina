import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { libInjectCss } from 'vite-plugin-lib-inject-css';

/**
 * 库构建配置（`pnpm build`）。
 *
 * 与 Storybook 无关：Storybook 走它自己的 `vite.config`，不吃这份配置，
 * 所以这里可以放心写死 `build.lib`。
 *
 * 产物形态的取舍：
 * - `preserveModules` 保留 `src/` 的模块粒度，使用方 bundler 才能按组件
 *   tree-shake；否则打成一整块，`import { Button }` 会把 Menu 一起带进来。
 * - `cssCodeSplit: true` 让每个组件各自产出一份 CSS；Vite 的 lib 模式默认
 *   关掉它（所有样式合并成一个文件），必须显式打开。
 * - `libInjectCss` 把 `import './xxx.css'` 注入到各 chunk 顶部：Vite 自己不会
 *   在产物 JS 里保留 CSS 引用，没有这一步使用方拿不到样式。
 */
export default defineConfig({
  plugins: [
    react(),
    libInjectCss(),
    {
      // 全局重置不参与组件样式，但要让需要的人能按 `lumina/reset.css` 引入
      name: 'lumina:emit-reset-css',
      generateBundle() {
        this.emitFile({
          type: 'asset',
          fileName: 'styles/global.css',
          source: readFileSync(
            fileURLToPath(new URL('./src/styles/global.css', import.meta.url)),
            'utf8',
          ),
        });
      },
    },
    dts({
      tsconfigPath: './tsconfig.build.json',
      include: ['src', 'types'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.stories.ts', 'src/**/*.test.tsx'],
    }),
  ],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    cssCodeSplit: true,
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // React 由使用方提供；clsx 保持外部依赖（在 dependencies 里声明）
      external: [/^react($|\/)/, /^react-dom($|\/)/, 'clsx'],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        // CSS Modules 在库构建时已经编译成哈希类名，产物里只是普通 CSS；
        // 去掉 `.module` 后缀，免得使用方的 bundler 再把它当 CSS Module 处理。
        assetFileNames: (assetInfo) =>
          (assetInfo.names?.[0] ?? '').replace(/\.module\.css$/, '.css') ||
          'assets/[name][extname]',
      },
    },
  },
});
