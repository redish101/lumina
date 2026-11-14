'use client';

/** 共享的快捷键键帽；生效的平台呈现由调用方提供。 */
import clsx from 'clsx';
import css from './shortcut-keys.module.css';

export type ShortcutKeysProps = {
  /** 生效的按键标签 */
  keys: readonly string[];
  /** `plain` 为无边框键帽；`tooltip` 为提示框内样式，用 `+` 分隔的组合会合并成一组 */
  variant?: 'plain' | 'tooltip';
  /** 追加在容器上的类名 */
  className?: string;
};

/**
 * 渲染一条命令的键帽，不负责默认绑定或本地化文案。
 *
 * 默认渲染无边框键帽；`tooltip` 变体渲染提示框内的键帽，并把以 `+` 分隔的组合
 * 合并到同一组里。
 */
export function ShortcutKeys({ keys, variant = 'plain', className }: ShortcutKeysProps) {
  return (
    <span
      className={clsx(
        css.keys,
        variant === 'tooltip' && css.tooltip,
        variant === 'tooltip' && keys.includes('+') && css.joined,
        className,
      )}
    >
      {keys.map((key, index) => (
        <kbd key={index} className={key === '+' ? css.separator : css.key}>
          {key}
        </kbd>
      ))}
    </span>
  );
}
