/** 展示文件路径：目录用次级颜色，最后一段用主色，长路径可中途换行。 */
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';
import css from './path-label.module.css';

export interface PathLabelProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'children' | 'title' | 'className'
> {
  /** 要展示的路径，支持 POSIX 与 Windows 分隔符。 */
  path: string;
  /** 追加在外层容器上的类名。 */
  className?: string;
}

function pathPartsOf(path: string): { directory: string; name: string } {
  const trimmed = path.replace(/[/\\]+$/, '');
  if (trimmed === '') return { directory: '', name: path };
  const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\')) + 1;
  return { directory: trimmed.slice(0, cut), name: trimmed.slice(cut) };
}

/**
 * 路径标签。
 *
 * 目录与文件名分别着色，悬停时通过原生 `title` 显示完整路径；
 * 窄容器里会在任意字符处换行，而不是横向溢出。
 */
export function PathLabel({ path, className, ...rest }: PathLabelProps) {
  const { directory, name } = pathPartsOf(path);

  return (
    <span {...rest} className={clsx(css.path, className)} title={path} data-path-label="">
      {directory !== '' && <span className={css.directory}>{directory}</span>}
      <span className={css.name}>{name}</span>
    </span>
  );
}
