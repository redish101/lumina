'use client';

/** 终端卡片：展示命令行、ANSI 着色输出、退出状态与折叠控制。 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import clsx from 'clsx';
import { CommandText } from '../command-text';
import { FoldToggle } from '../fold-toggle';
import { StateDot, type StateDotState } from '../state-dot';
import css from './terminal-block.module.css';

export interface TerminalBlockLabels {
  /** 第 n 行命令的无障碍名称。 */
  commandLine: (line: number) => string;
  /** 被信号终止时的状态文案。 */
  signal: (signal: string) => string;
  /** 非零退出码的状态文案。 */
  exitCode: (exitCode: number) => string;
  /** 结束但没有退出码时的状态文案。 */
  noExitCode: string;
  /** 运行中的状态文案。 */
  running: string;
  /** 失败状态文案。 */
  failed: string;
  /** 成功结束的状态文案。 */
  done: string;
  /** 复制按钮文案。 */
  copy: string;
  /** 复制成功后的反馈文案。 */
  copied: string;
  /** 没有可见输出时的占位文案。 */
  noOutput: string;
  /** 展开状态下的折叠按钮无障碍名称。 */
  collapseAria: string;
  /** 展开状态下的折叠按钮文案。 */
  collapse: string;
  /** 折叠状态下的展开按钮无障碍名称。 */
  expandAria: (hidden: number) => string;
  /** 折叠状态下的展开按钮文案。 */
  expand: (hidden: number) => string;
}

export interface TerminalBlockProps {
  /** 执行的命令，按换行拆成多条提示行。 */
  command: string;
  /** 工作目录，仅显示最后一段；缺省时提示符为 `$`。 */
  cwd?: string;
  /** 用户主目录，用于把相同的 cwd 折叠为 `~`。 */
  home?: string;
  /** 命令输出，可包含 ANSI 转义序列。 */
  output?: string;
  /** 结束时的退出码；`null` 表示结束但未拿到退出码。 */
  exitCode?: number | null;
  /** 结束信号，优先级高于退出码。 */
  signal?: string;
  /** 命令是否仍在运行，默认 `false`。 */
  running?: boolean;
  /** 是否为后台任务，默认 `false`；后台任务不显示输出与状态。 */
  background?: boolean;
  /** 折叠前最多显示的输出行数，默认 `16`；传 `Infinity` 关闭折叠。 */
  maxLines?: number;
  /** 复制内容的覆盖值；提供后即使还没有输出也会显示复制按钮。 */
  copyText?: string;
  /** 是否显示运行状态圆点，默认 `true`。 */
  runStateDot?: boolean;
  /** 覆盖默认中文文案。 */
  labels?: Partial<TerminalBlockLabels>;
  /** 追加在卡片上的类名。 */
  className?: string;
}

const DEFAULT_LABELS: TerminalBlockLabels = {
  commandLine: (line) => `第 ${line} 行命令`,
  signal: (signal) => `信号 ${signal}`,
  exitCode: (exitCode) => `退出码 ${exitCode}`,
  noExitCode: '无退出码',
  running: '运行中',
  failed: '失败',
  done: '完成',
  copy: '复制',
  copied: '已复制',
  noOutput: '无输出',
  collapseAria: '收起输出',
  collapse: '收起',
  expandAria: (hidden) => `展开剩余 ${hidden} 行`,
  expand: (hidden) => `展开剩余 ${hidden} 行`,
};

interface SgrState {
  fg: string;
  bg: string;
  attrs: readonly string[];
}

const SGR_NONE: SgrState = { fg: '', bg: '', attrs: [] };

const ATTR_CLOSERS: Record<string, readonly string[]> = {
  '22': ['1', '2'],
  '23': ['3'],
  '24': ['4'],
  '25': ['5', '6'],
  '27': ['7'],
  '28': ['8'],
  '29': ['9'],
};

const BASIC_COLORS: Record<string, string> = {
  '30': 'var(--lumina-alias-label-primary)',
  '31': 'var(--lumina-alias-state-error-primary)',
  '32': 'var(--lumina-alias-state-success-primary)',
  '33': 'var(--lumina-alias-state-warn-primary)',
  '34': 'var(--lumina-alias-state-business-primary)',
  '35': 'var(--lumina-static-violet-400)',
  '36': 'var(--lumina-static-blue-600)',
  '37': 'var(--lumina-alias-label-secondary)',
  '90': 'var(--lumina-alias-label-tertiary)',
  '91': 'var(--lumina-alias-state-error-secondary)',
  '92': 'var(--lumina-alias-state-success-secondary)',
  '93': 'var(--lumina-alias-state-warn-secondary)',
  '94': 'var(--lumina-static-blue-400)',
  '95': 'var(--lumina-static-violet-600)',
  '96': 'var(--lumina-static-blue-500)',
  '97': 'var(--lumina-alias-label-primary)',
};

const BASIC_PALETTE: readonly string[] = [
  BASIC_COLORS['30'],
  BASIC_COLORS['31'],
  BASIC_COLORS['32'],
  BASIC_COLORS['33'],
  BASIC_COLORS['34'],
  BASIC_COLORS['35'],
  BASIC_COLORS['36'],
  BASIC_COLORS['37'],
  BASIC_COLORS['90'],
  BASIC_COLORS['91'],
  BASIC_COLORS['92'],
  BASIC_COLORS['93'],
  BASIC_COLORS['94'],
  BASIC_COLORS['95'],
  BASIC_COLORS['96'],
  BASIC_COLORS['97'],
];

interface AnsiSpan {
  text: string;
  style: CSSProperties | undefined;
}

type AnsiLine = readonly AnsiSpan[];

interface Cell {
  text: string;
  state: SgrState;
}

function sameSgr(a: SgrState, b: SgrState): boolean {
  return (
    a.fg === b.fg &&
    a.bg === b.bg &&
    a.attrs.length === b.attrs.length &&
    a.attrs.every((attr, index) => attr === b.attrs[index])
  );
}

function foldSgr(state: SgrState, params: string): SgrState {
  const codes = params === '' ? ['0'] : params.split(';');
  let next = state;

  for (let index = 0; index < codes.length; index += 1) {
    const code = codes[index] ?? '';
    if (code === '' || code === '0') {
      next = SGR_NONE;
      continue;
    }

    if (code === '38' || code === '48') {
      const kind = codes[index + 1] ?? '';
      const span = kind === '2' ? 4 : kind === '5' ? 2 : 0;
      if (span > 0) {
        const value = codes.slice(index, index + span + 1).join(';');
        next = code === '38' ? { ...next, fg: value } : { ...next, bg: value };
      }
      index += span;
      continue;
    }

    const closers = ATTR_CLOSERS[code];
    if (closers !== undefined) {
      next = { ...next, attrs: next.attrs.filter((attr) => !closers.includes(attr)) };
      continue;
    }

    if (code === '39') {
      next = { ...next, fg: '' };
      continue;
    }
    if (code === '49') {
      next = { ...next, bg: '' };
      continue;
    }

    const numeric = Number(code);
    if ((numeric >= 30 && numeric <= 37) || (numeric >= 90 && numeric <= 97)) {
      next = { ...next, fg: code };
      continue;
    }
    if ((numeric >= 40 && numeric <= 47) || (numeric >= 100 && numeric <= 107)) {
      next = { ...next, bg: code };
      continue;
    }

    if (!next.attrs.includes(code)) next = { ...next, attrs: [...next.attrs, code] };
  }

  return next;
}

function paletteColor(index: number): string | undefined {
  if (!Number.isInteger(index) || index < 0 || index > 255) return undefined;
  if (index < 16) return BASIC_PALETTE[index];
  if (index < 232) {
    const offset = index - 16;
    const levels = [0, 95, 135, 175, 215, 255];
    const red = levels[Math.floor(offset / 36)] ?? 0;
    const green = levels[Math.floor(offset / 6) % 6] ?? 0;
    const blue = levels[offset % 6] ?? 0;
    return `rgb(${red} ${green} ${blue})`;
  }
  const level = 8 + (index - 232) * 10;
  return `rgb(${level} ${level} ${level})`;
}

function colorOf(value: string): string | undefined {
  if (value === '') return undefined;
  const basic = BASIC_COLORS[value];
  if (basic !== undefined) return basic;

  const parts = value.split(';');
  if (parts[0] === '38' || parts[0] === '48') {
    if (parts[1] === '5') return paletteColor(Number(parts[2]));
    if (parts[1] === '2') return `rgb(${parts[2]} ${parts[3]} ${parts[4]})`;
  }
  return undefined;
}

function styleOf(state: SgrState): CSSProperties | undefined {
  const style: CSSProperties = {};
  let foreground = colorOf(state.fg);
  let background = colorOf(state.bg);

  if (state.attrs.includes('7')) {
    const swappedForeground = background ?? 'var(--lumina-alias-markdown-code-block)';
    background = foreground ?? 'var(--lumina-alias-label-primary)';
    foreground = swappedForeground;
  }

  if (foreground !== undefined) style.color = foreground;
  if (background !== undefined) style.backgroundColor = background;
  if (state.attrs.includes('1')) style.fontWeight = 700;
  if (state.attrs.includes('2')) style.opacity = 0.7;
  if (state.attrs.includes('3')) style.fontStyle = 'italic';
  if (state.attrs.includes('8')) style.visibility = 'hidden';

  const decorations: string[] = [];
  if (state.attrs.includes('4')) decorations.push('underline');
  if (state.attrs.includes('9')) decorations.push('line-through');
  if (decorations.length > 0) style.textDecoration = decorations.join(' ');

  return Object.keys(style).length === 0 ? undefined : style;
}

interface Escape {
  length: number;
  type: 'csi' | 'osc' | 'other';
  params?: string;
  final?: string;
}

function readEscape(line: string, index: number): Escape {
  let cursor = index + 1;

  if (line[cursor] === '[') {
    cursor += 1;
    let params = '';
    while (cursor < line.length) {
      const char = line[cursor] ?? '';
      const isParameter =
        (char >= '0' && char <= '9') ||
        char === ';' ||
        char === '?' ||
        (char >= ' ' && char <= '/');
      if (!isParameter) break;
      params += char;
      cursor += 1;
    }
    const final = line[cursor];
    if (final !== undefined && final >= '@' && final <= '~') {
      return { length: cursor - index + 1, type: 'csi', params, final };
    }
    return { length: 1, type: 'other' };
  }

  if (line[cursor] === ']') {
    cursor += 1;
    while (cursor < line.length) {
      if (line[cursor] === '\u0007') return { length: cursor - index + 1, type: 'osc' };
      if (line[cursor] === '\u001b' && line[cursor + 1] === '\\') {
        return { length: cursor - index + 2, type: 'osc' };
      }
      cursor += 1;
    }
    return { length: line.length - index, type: 'osc' };
  }

  cursor += 1;
  while (cursor < line.length) {
    const char = line[cursor] ?? '';
    if (char < ' ' || char > '/') break;
    cursor += 1;
  }
  if (cursor < line.length) {
    const char = line[cursor] ?? '';
    if (char >= '0' && char <= '~') cursor += 1;
  }
  return { length: Math.max(1, cursor - index), type: 'other' };
}

function eraseLine(cells: (Cell | undefined)[], cursor: number, params: string): void {
  const mode = params.split(';')[0] ?? '0';
  if (mode === '' || mode === '0') {
    if (cells.length > cursor) cells.length = cursor;
  } else if (mode === '1') {
    for (let index = 0; index < cursor; index += 1) cells[index] = { text: ' ', state: SGR_NONE };
  } else if (mode === '2') {
    cells.length = 0;
  }
}

function parseAnsiLine(line: string, entry: SgrState): { spans: AnsiLine; state: SgrState } {
  const cells: (Cell | undefined)[] = [];
  let cursor = 0;
  let state = entry;
  let index = 0;

  const write = (text: string): void => {
    while (cells.length < cursor) cells.push({ text: ' ', state: SGR_NONE });
    const cell: Cell = { text, state };
    if (cursor < cells.length) cells[cursor] = cell;
    else cells.push(cell);
    cursor += 1;
  };

  while (index < line.length) {
    const char = line[index] ?? '';

    if (char === '\u001b') {
      const escape = readEscape(line, index);
      if (escape.type === 'csi' && escape.final === 'm') {
        state = foldSgr(state, escape.params ?? '');
      } else if (escape.type === 'csi' && escape.final === 'K') {
        eraseLine(cells, cursor, escape.params ?? '');
      }
      index += escape.length;
      continue;
    }

    if (char === '\r') {
      cursor = 0;
      index += 1;
      continue;
    }
    if (char === '\b') {
      cursor = Math.max(0, cursor - 1);
      index += 1;
      continue;
    }
    if (char === '\t') {
      const width = 8 - (cursor % 8);
      for (let step = 0; step < width; step += 1) write(' ');
      index += 1;
      continue;
    }

    const code = char.codePointAt(0);
    if (code === undefined) {
      index += 1;
      continue;
    }
    if (code < 0x20 || code === 0x7f) {
      index += 1;
      continue;
    }
    const text = String.fromCodePoint(code);
    write(text);
    index += text.length;
  }

  const runs: { text: string; state: SgrState }[] = [];
  for (const cell of cells) {
    const text = cell?.text ?? ' ';
    const cellState = cell?.state ?? SGR_NONE;
    const last = runs[runs.length - 1];
    if (last !== undefined && sameSgr(last.state, cellState)) last.text += text;
    else runs.push({ text, state: cellState });
  }

  return {
    spans: runs.map((run) => ({ text: run.text, style: styleOf(run.state) })),
    state,
  };
}

function parseAnsiLines(text: string): AnsiLine[] {
  const lines: AnsiLine[] = [];
  let state: SgrState = SGR_NONE;
  for (const line of text.split('\n')) {
    const parsed = parseAnsiLine(line, state);
    lines.push(parsed.spans);
    state = parsed.state;
  }
  return lines;
}

function promptLabel(cwd: string, home: string | undefined): string {
  const trimmed = cwd.replace(/[/\\]+$/, '');
  if (home !== undefined && trimmed === home.replace(/[/\\]+$/, '')) return '~';
  const segment = trimmed.split(/[/\\]/).pop();
  return segment === undefined || segment === '' ? cwd : segment;
}

function statusText(
  exitCode: number | null | undefined,
  signal: string | undefined,
  labels: TerminalBlockLabels,
): string | undefined {
  if (signal !== undefined) return labels.signal(signal);
  if (exitCode === null) return labels.noExitCode;
  if (exitCode !== undefined && exitCode !== 0) return labels.exitCode(exitCode);
  return undefined;
}

function runState(
  running: boolean,
  exitCode: number | null | undefined,
  signal: string | undefined,
  labels: TerminalBlockLabels,
): { state: StateDotState; label: string } {
  if (running) return { state: 'ongoing', label: labels.running };
  if (statusText(exitCode, signal, labels) !== undefined) {
    return { state: 'error', label: labels.failed };
  }
  return { state: 'done', label: labels.done };
}

function renderLine(line: AnsiLine) {
  return line.map((span, index) =>
    span.style === undefined ? (
      span.text
    ) : (
      <span key={index} style={span.style}>
        {span.text}
      </span>
    ),
  );
}

/**
 * 终端块。
 *
 * 用等宽字体展示命令与输出，支持常用 ANSI SGR 颜色和属性；输出超过
 * `maxLines` 时折叠中段，并根据运行状态、信号或退出码给出状态提示。
 */
export function TerminalBlock({
  command,
  cwd,
  home,
  output,
  exitCode,
  signal,
  running = false,
  background = false,
  maxLines = 16,
  copyText,
  runStateDot = true,
  labels,
  className,
}: TerminalBlockProps) {
  const resolvedLabels: TerminalBlockLabels = { ...DEFAULT_LABELS, ...labels };
  const text = output ?? '';

  const lines = useMemo(() => {
    const parsed = parseAnsiLines(text);
    const last = parsed[parsed.length - 1];
    const terminated =
      parsed.length > 1 && last !== undefined && last.every((span) => span.text === '');
    return terminated ? parsed.slice(0, -1) : parsed;
  }, [text]);

  const commandLines = useMemo(() => {
    const body = command.endsWith('\n') ? command.slice(0, -1) : command;
    return body.split('\n');
  }, [command]);

  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const empty = lines.every((line) => line.every((span) => span.text.trim() === ''));
  const status = background ? undefined : statusText(exitCode, signal, resolvedLabels);
  const state = runState(running, exitCode, signal, resolvedLabels);
  const showState = runStateDot && (!background || running);
  const showBody = !background && (!running || !empty);
  const showCopy = copyText !== undefined || (!background && !running && !empty);

  const hidden = lines.length - maxLines;
  const headLines = Math.ceil(maxLines / 2);
  const tailLines = maxLines - headLines;
  const capped = hidden > 0 && !expanded;

  const handleCopy = async () => {
    if (typeof navigator === 'undefined' || navigator.clipboard === undefined) return;
    try {
      await navigator.clipboard.writeText(copyText ?? text);
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
    <div
      className={clsx(css.block, className)}
      data-terminal=""
      data-running={running ? '' : undefined}
      data-body={showBody ? '' : undefined}
    >
      <div className={css.header}>
        <div className={css.prompt}>
          {showState && <span className={css.runStateLabel}>{state.label}</span>}
          {commandLines.map((line, index) => (
            <div key={index} className={css.promptLine}>
              {index === 0 && showState && (
                <StateDot state={state.state} className={css.runState} />
              )}
              <span className={css.cwd}>
                {index > 0 || cwd === undefined ? '$' : promptLabel(cwd, home)}
              </span>
              <CommandText
                className={css.command}
                text={line}
                label={resolvedLabels.commandLine(index + 1)}
              />
            </div>
          ))}
        </div>

        {status !== undefined && <span className={css.status}>{status}</span>}

        {showCopy && (
          <button type="button" className={css.copyButton} onClick={handleCopy}>
            {copied ? resolvedLabels.copied : resolvedLabels.copy}
          </button>
        )}
      </div>

      {showBody &&
        (empty ? (
          <div className={css.empty}>{resolvedLabels.noOutput}</div>
        ) : (
          <div className={css.output}>
            {(capped ? lines.slice(0, headLines) : lines).map((line, index) => (
              <div key={index} className={css.line}>
                {renderLine(line)}
              </div>
            ))}

            {hidden > 0 && (
              <FoldToggle
                className={css.expand}
                expanded={expanded}
                hidden={hidden}
                labels={resolvedLabels}
                onToggle={() => setExpanded((value) => !value)}
              />
            )}

            {capped &&
              lines.slice(lines.length - tailLines).map((line, index) => (
                <div key={`tail-${index}`} className={css.line}>
                  {renderLine(line)}
                </div>
              ))}
          </div>
        ))}

      {copied && (
        <span className={css.srOnly} role="status">
          {resolvedLabels.copied}
        </span>
      )}
    </div>
  );
}
