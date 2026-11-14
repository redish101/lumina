import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig(({ command }) => {
  // `vite build` 打库产物；`vite dev` 只用于本地联调（Storybook 用的是 vite.config.ts 的
  // 非 build 部分），此时不生成类型声明。
  const isLibBuild = command === 'build';

  return {
    plugins: [
      react(),
      ...(isLibBuild
        ? [
            dts({
              tsconfigPath: './tsconfig.build.json',
              include: ['src'],
              exclude: ['**/*.stories.tsx', '**/*.test.tsx'],
            }),
          ]
        : []),
    ],
    build: {
      // 库构建时外部化 React，并输出 ESM + CJS 两份产物；
      // 同一份 CSS Module 会被抽取为 dist/style.css。
      lib: {
        entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
        formats: ['es', 'cjs'],
        fileName: (format) => (format === 'es' ? 'lumina.js' : 'lumina.cjs'),
        cssFileName: 'style',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', /^react\//, /^react-dom\//],
      },
      sourcemap: true,
      emptyOutDir: true,
    },
  };
});
