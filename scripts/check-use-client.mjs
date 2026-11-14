#!/usr/bin/env node
/**
 * 检查 `'use client'` 指令是否写在该写的地方。
 *
 * 规则：组件文件里只要用到 React hooks 或事件处理，就必须以 `'use client'` 开头。
 * 漏写的后果是使用方在 Server Component 里渲染时报
 * `Cannot read properties of null (reading 'useContext')`。
 *
 * 纯展示组件（无 hooks、无事件处理）不加指令是**有意为之**：它们可以作为
 * Server Component 渲染，不向客户端下发 JS。
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));
const IGNORED = [/\.stories\.tsx$/, /\.test\.tsx$/];
const HOOKS =
  /\buse(?:State|Effect|Ref|Context|Reducer|LayoutEffect|SyncExternalStore|Id|Callback|Memo|Transition|DeferredValue|Optimistic|ActionState|InsertionEffect)\s*\(|\bcreateContext\s*\(|\bforwardRef\s*[<(]|\bmemo\s*\(/;
const HANDLERS = /\son[A-Z][A-Za-z]*=\{/;

/** @param {string} dir */
function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith('.tsx')) yield path;
  }
}

const problems = [];
let withDirective = 0;
let withoutDirective = 0;

for (const file of walk(srcDir)) {
  if (IGNORED.some((pattern) => pattern.test(file))) continue;

  const source = readFileSync(file, 'utf8');
  const hasDirective = /^\s*(['"])use client\1/.test(source);
  const needsDirective = HOOKS.test(source) || HANDLERS.test(source);

  if (hasDirective) withDirective += 1;
  else withoutDirective += 1;

  if (needsDirective && !hasDirective) {
    problems.push(`${relative(process.cwd(), file)}：用了 hooks 或事件处理，缺 'use client'`);
  }
  if (!needsDirective && hasDirective) {
    problems.push(
      `${relative(process.cwd(), file)}：没用到 hooks/事件处理，指令可以去掉（让它留在服务端渲染）`,
    );
  }
}

if (problems.length > 0) {
  console.error("✖ 'use client' 指令检查未通过：\n");
  for (const problem of problems) console.error(`  ${problem}`);
  console.error('');
  process.exit(1);
}

console.log(
  `✔ 'use client' 指令检查通过（${withDirective} 个客户端组件，${withoutDirective} 个服务端可用）`,
);
