/**
 * 构建产物体检（`pnpm build` 结束后自动执行）。
 *
 * 这里校验的都是「配错了不会报错、但使用方会踩坑」的形态问题：
 * 1. CSS Modules 已编译成普通 CSS —— 残留 `.module.css` 会被消费方 bundler 丢掉
 * 2. 入口、令牌、重置文件都在 —— 发布后才发现少文件就晚了
 * 3. 没有内部实现目录漏出来 —— `dist/utils`、`dist/internal` 不该出现在产物里
 */
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// 仓库路径可能含非 ASCII 字符，必须走 fileURLToPath 而不是 URL.pathname
const dist = fileURLToPath(new URL('../dist/', import.meta.url));

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const full = join(directory, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const files = walk(dist).map((file) => relative(dist, file));
const problems = [];

for (const file of files) {
  if (file.endsWith('.module.css')) problems.push(`残留 CSS Module 产物：${file}`);
  if (/^(utils|internal)\//.test(file)) problems.push(`内部实现泄漏到产物：${file}`);
  if (/\.(stories|test)\.[jt]sx?$/.test(file)) problems.push(`测试/示例代码进了产物：${file}`);
}

for (const required of ['index.js', 'index.d.ts', 'styles/tokens.css', 'styles/reset.css']) {
  if (!files.includes(required)) problems.push(`缺少必需产物：${required}`);
}

const componentCss = files.filter((file) => /^components\/.+\/.+\.css$/.test(file));
if (componentCss.length === 0) problems.push('没有任何组件级 CSS 产物，cssCodeSplit 可能被关掉了');

if (problems.length > 0) {
  console.error('✗ 产物校验失败：');
  for (const problem of problems) console.error(`  · ${problem}`);
  process.exit(1);
}

console.log(`✓ 产物校验通过（${files.length} 个文件，${componentCss.length} 份组件 CSS）`);
