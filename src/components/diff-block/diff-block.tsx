'use client';

/** 渲染文件级行差异：新增、删除与上下文着色，长内容可折叠。 */
import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconCheckOutline } from '../../icons';
import { FoldToggle, type FoldToggleLabels } from '../fold-toggle';
import css from './diff-block.module.css';

export interface DiffHunk {
  /** 文件路径。 */
  path: string;
  /** 修改前的文本；`null` 表示新建文件。 */
  oldText: string | null;
  /** 修改后的文本。 */
  newText: string;
}

export interface DiffBlockLabels extends FoldToggleLabels {
  /** 复制按钮文案。 */
  copy: string;
  /** 复制成功后的反馈文案。 */
  copied: string;
}

export interface DiffBlockProps {
  /** 一组文件差异，按数组顺序渲染。 */
  diffs: readonly DiffHunk[];
  /** 折叠时最多显示的行数，默认 `16`。 */
  maxLines?: number;
  /** 覆盖默认中文文案。 */
  labels?: Partial<DiffBlockLabels>;
  /** 是否让长行自动换行；默认横向滚动。 */
  wrap?: boolean;
  /** 追加在卡片上的类名。 */
  className?: string;
}

const DEFAULT_LABELS: DiffBlockLabels = {
  collapseAria: '收起差异',
  expandAria: (hidden) => `展开剩余 ${hidden} 行`,
  collapse: '收起',
  expand: (hidden) => `展开剩余 ${hidden} 行`,
  copy: '复制',
  copied: '已复制',
};

const CONTEXT_LINES = 3;
const MAX_LCS_CELLS = 120_000;

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  css: 'css',
  go: 'go',
  html: 'html',
  js: 'js',
  jsx: 'jsx',
  json: 'json',
  md: 'markdown',
  py: 'python',
  rs: 'rust',
  sh: 'bash',
  ts: 'ts',
  tsx: 'tsx',
  yml: 'yaml',
  yaml: 'yaml',
};

type DiffRowKind = 'path' | 'gap' | 'context' | 'add' | 'del';

interface DiffRow {
  kind: DiffRowKind;
  text: string;
}

function CopyIcon() {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      aria-hidden="true"
    >
      <rect x="5.5" y="5.5" width="7" height="7" rx="1.5" />
      <path d="M10.5 3.5v-1a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1" />
    </svg>
  );
}

function contentLines(text: string | null): string[] {
  if (text === null) return [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  if (lines.length === 1 && lines[0] === '') return [];
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  return lines;
}

function trimContext(rows: DiffRow[]): DiffRow[] {
  if (!rows.some((row) => row.kind !== 'context')) return [];

  const keep = new Uint8Array(rows.length);
  for (let index = 0; index < rows.length; index += 1) {
    if (rows[index].kind === 'context') continue;
    const start = Math.max(0, index - CONTEXT_LINES);
    const end = Math.min(rows.length - 1, index + CONTEXT_LINES);
    for (let cursor = start; cursor <= end; cursor += 1) keep[cursor] = 1;
  }

  const trimmed: DiffRow[] = [];
  let index = 0;
  while (index < rows.length) {
    if (keep[index] === 1) {
      trimmed.push(rows[index]);
      index += 1;
      continue;
    }
    while (index < rows.length && keep[index] !== 1) index += 1;
    trimmed.push({ kind: 'gap', text: '⋯' });
  }
  return trimmed;
}

function diffLines(oldLines: readonly string[], newLines: readonly string[]): DiffRow[] {
  const rows: DiffRow[] = [];

  if (oldLines.length * newLines.length > MAX_LCS_CELLS) {
    for (const text of oldLines) rows.push({ kind: 'del', text });
    for (const text of newLines) rows.push({ kind: 'add', text });
    return trimContext(rows);
  }

  const width = newLines.length + 1;
  const table = new Uint32Array((oldLines.length + 1) * width);
  for (let i = oldLines.length - 1; i >= 0; i -= 1) {
    for (let j = newLines.length - 1; j >= 0; j -= 1) {
      table[i * width + j] =
        oldLines[i] === newLines[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }

  let i = 0;
  let j = 0;
  while (i < oldLines.length && j < newLines.length) {
    if (oldLines[i] === newLines[j]) {
      rows.push({ kind: 'context', text: oldLines[i] });
      i += 1;
      j += 1;
    } else if (table[(i + 1) * width + j] >= table[i * width + j + 1]) {
      rows.push({ kind: 'del', text: oldLines[i] });
      i += 1;
    } else {
      rows.push({ kind: 'add', text: newLines[j] });
      j += 1;
    }
  }
  while (i < oldLines.length) {
    rows.push({ kind: 'del', text: oldLines[i] });
    i += 1;
  }
  while (j < newLines.length) {
    rows.push({ kind: 'add', text: newLines[j] });
    j += 1;
  }

  return trimContext(rows);
}

function buildRows(diffs: readonly DiffHunk[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let previousPath: string | undefined;

  for (const diff of diffs) {
    if (previousPath === diff.path) rows.push({ kind: 'gap', text: '⋯' });
    else rows.push({ kind: 'path', text: diff.path });
    rows.push(...diffLines(contentLines(diff.oldText), contentLines(diff.newText)));
    previousPath = diff.path;
  }

  return rows;
}

function copyTextOf(rows: readonly DiffRow[]): string {
  return rows
    .map((row) => {
      switch (row.kind) {
        case 'del':
          return `- ${row.text}`;
        case 'add':
          return `+ ${row.text}`;
        case 'context':
          return `  ${row.text}`;
        default:
          return row.text;
      }
    })
    .join('\n');
}

function languageOf(path: string): string | undefined {
  const name = path.slice(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1);
  const dot = name.lastIndexOf('.');
  if (dot < 0) return undefined;
  return LANGUAGE_BY_EXTENSION[name.slice(dot + 1).toLowerCase()];
}

function headTailCap(rows: readonly DiffRow[], maxLines: number, expanded: boolean) {
  const hidden = rows.length - maxLines;
  if (expanded || hidden <= 0) {
    return { head: rows, tail: [] as readonly DiffRow[], hidden: Math.max(0, hidden) };
  }
  const headCount = Math.ceil(maxLines / 2);
  return {
    head: rows.slice(0, headCount),
    tail: rows.slice(rows.length - (maxLines - headCount)),
    hidden,
  };
}

function DiffLine({ row }: { row: DiffRow }) {
  return (
    <div className={clsx(css.line, css[row.kind])} data-kind={row.kind}>
      {row.text === '' ? '\u200b' : row.text}
    </div>
  );
}

/**
 * 差异块。
 *
 * 按文件路径分组，用行级 LCS 计算新增、删除与上下文，长差异默认折叠到
 * `maxLines` 行；头部提供复制按钮，复制内容与屏幕上的行前缀一致。
 */
export function DiffBlock({
  diffs,
  maxLines = 16,
  labels,
  wrap = false,
  className,
}: DiffBlockProps) {
  const resolvedLabels: DiffBlockLabels = { ...DEFAULT_LABELS, ...labels };
  const rows = useMemo(() => buildRows(diffs), [diffs]);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { head, tail, hidden } = headTailCap(rows, maxLines, expanded);

  const first = diffs[0];
  const heading = diffs.length === 1 && first !== undefined ? first.path : `${diffs.length} 个文件`;
  const language = first === undefined ? undefined : languageOf(first.path);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || navigator.clipboard === undefined) return;
    try {
      await navigator.clipboard.writeText(copyTextOf(rows));
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setCopied(false);
      timer.current = null;
    }, 1200);
  };

  return (
    <div className={clsx(css.card, className)}>
      <div className={css.header}>
        <div className={css.heading}>
          {language !== undefined && <span className={css.language}>{language}</span>}
          <span className={css.title}>{heading}</span>
        </div>
        <div className={css.actions}>
          <button
            type="button"
            className={css.action}
            aria-label={copied ? resolvedLabels.copied : resolvedLabels.copy}
            onClick={handleCopy}
          >
            {copied ? <IconCheckOutline size={13} /> : <CopyIcon />}
            <span>{copied ? resolvedLabels.copied : resolvedLabels.copy}</span>
          </button>
        </div>
      </div>

      <div className={css.body} data-wrap={wrap ? '' : undefined}>
        <div className={css.rows}>
          {head.map((row, index) => (
            <DiffLine key={`head-${index}`} row={row} />
          ))}
          {hidden > 0 && (
            <FoldToggle
              className={css.fold}
              expanded={expanded}
              hidden={hidden}
              labels={resolvedLabels}
              onToggle={() => setExpanded((value) => !value)}
            />
          )}
          {tail.map((row, index) => (
            <DiffLine key={`tail-${index}`} row={row} />
          ))}
        </div>
      </div>
      {copied && (
        <span className={css.srOnly} role="status">
          {resolvedLabels.copied}
        </span>
      )}
    </div>
  );
}
