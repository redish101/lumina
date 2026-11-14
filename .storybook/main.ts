import type { StorybookConfig } from '@storybook/react-vite';
import { fileURLToPath } from 'node:url';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
    // MDX 默认不带 GFM 语法，补上后才能用表格、删除线、任务列表等。
    // 注意：Must be passed as a URL/specifier（见 storybook 文档），直接传函数在 vite builder 下不生效。
    mdxPluginOptions: {
      mdxCompileOptions: {
        remarkPlugins: [fileURLToPath(import.meta.resolve('remark-gfm'))],
      },
    },
  },
  typescript: {
    // 用 react-docgen 从 TS 源码生成 props 表格（Storybook 默认，速度快）
    reactDocgen: 'react-docgen',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};

export default config;
