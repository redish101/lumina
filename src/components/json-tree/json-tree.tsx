'use client';

/** 以树形展示任意 JSON 数据，支持按层默认展开与方向键折叠。 */
import { useId, useState } from 'react';
import type { KeyboardEvent } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutline, IconChevronRightOutline } from '../../icons';
import css from './json-tree.module.css';

export interface JsonTreeProps {
  /** 要展示的数据，支持 JSON 值以及 Date、BigInt、undefined 等。 */
  data: unknown;
  /** 默认展开到第几层；`1` 只展开根节点，默认 `1`。 */
  defaultExpandedDepth?: number;
  /** 树的读屏标签，默认 `JSON`。 */
  label?: string;
  /** 追加在外层容器上的类名。 */
  className?: string;
}

type JsonContainer = Record<string, unknown> | unknown[];

function isContainer(value: unknown): value is JsonContainer {
  if (Array.isArray(value)) return true;
  if (value === null || typeof value !== 'object') return false;
  return !(value instanceof Date);
}

function entriesOf(value: JsonContainer): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.map((item, index): [string, unknown] => [String(index), item]);
  }
  return Object.keys(value).map((key): [string, unknown] => [key, value[key]]);
}

function formatPrimitive(value: unknown): string {
  if (value === null) return 'null';
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  switch (typeof value) {
    case 'string': {
      const text = JSON.stringify(value) ?? '""';
      return text.length > 160 ? `${text.slice(0, 159)}…` : text;
    }
    case 'number':
      return String(value);
    case 'boolean':
      return value ? 'true' : 'false';
    case 'bigint':
      return `${value.toString()}n`;
    case 'undefined':
      return 'undefined';
    case 'function':
      return '[Function]';
    case 'symbol':
      return value.toString();
    default:
      return String(value);
  }
}

function previewOf(value: unknown, depth = 0): string {
  if (isContainer(value)) {
    if (depth >= 2) return Array.isArray(value) ? '[…]' : '{…}';
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      const shown = value.slice(0, 5).map((item) => previewOf(item, depth + 1));
      return `[${shown.join(', ')}${value.length > 5 ? ', …' : ''}]`;
    }
    const keys = Object.keys(value);
    if (keys.length === 0) return '{}';
    const shown = keys.slice(0, 4).map((key) => `${key}: ${previewOf(value[key], depth + 1)}`);
    return `{${shown.join(', ')}${keys.length > 4 ? ', …' : ''}}`;
  }
  return formatPrimitive(value);
}

function PrimitiveValue({ value }: { value: unknown }) {
  if (value === null) return <span className={css.keyword}>null</span>;
  if (value instanceof Date) {
    return <span className={css.string}>{JSON.stringify(value.toISOString())}</span>;
  }
  switch (typeof value) {
    case 'string':
      return <span className={css.string}>{formatPrimitive(value)}</span>;
    case 'number':
      return <span className={css.number}>{formatPrimitive(value)}</span>;
    case 'bigint':
      return <span className={css.number}>{formatPrimitive(value)}</span>;
    case 'boolean':
      return <span className={css.keyword}>{formatPrimitive(value)}</span>;
    case 'undefined':
      return <span className={css.keyword}>undefined</span>;
    case 'function':
      return <span className={css.keyword}>[Function]</span>;
    case 'symbol':
      return <span className={css.keyword}>{value.toString()}</span>;
    default:
      return <span className={css.string}>{String(value)}</span>;
  }
}

interface JsonNodeProps {
  name: string;
  value: unknown;
  depth: number;
  defaultExpandedDepth: number;
  isLast: boolean;
  ancestors: readonly object[];
}

function JsonNode({ name, value, depth, defaultExpandedDepth, isLast, ancestors }: JsonNodeProps) {
  const contentId = useId();
  const container = isContainer(value) ? value : null;
  const circular = container !== null && ancestors.includes(container);
  const canExpand = container !== null && !circular;
  const [expanded, setExpanded] = useState(
    () => container !== null && !circular && depth < defaultExpandedDepth,
  );
  const entries = container !== null && !circular ? entriesOf(container) : [];
  const open = canExpand && expanded;
  const nextAncestors = container !== null ? [...ancestors, container] : ancestors;

  const toggle = () => {
    if (canExpand) setExpanded((current) => !current);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canExpand) return;
    if (event.key === 'ArrowRight' && !expanded) {
      event.preventDefault();
      setExpanded(true);
    } else if (event.key === 'ArrowLeft' && expanded) {
      event.preventDefault();
      setExpanded(false);
    }
  };

  return (
    <div
      className={css.node}
      role="treeitem"
      aria-level={depth}
      aria-expanded={canExpand ? expanded : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className={css.row}>
        {canExpand ? (
          <button
            type="button"
            className={css.expander}
            aria-label={expanded ? '收起' : '展开'}
            aria-expanded={expanded}
            aria-controls={expanded ? contentId : undefined}
            onClick={toggle}
          >
            {expanded ? (
              <IconChevronDownOutline size={12} />
            ) : (
              <IconChevronRightOutline size={12} />
            )}
          </button>
        ) : (
          <span className={css.expanderPlaceholder} aria-hidden="true" />
        )}

        <span className={css.summary}>
          <span className={css.property}>{name}</span>
          <span className={css.punctuation}>: </span>
          {circular ? (
            <span className={css.keyword}>[循环引用]</span>
          ) : container !== null ? (
            expanded ? (
              <span className={css.punctuation}>{Array.isArray(container) ? '[' : '{'}</span>
            ) : (
              <span className={css.preview}>{previewOf(container)}</span>
            )
          ) : (
            <PrimitiveValue value={value} />
          )}
          {!isLast && <span className={css.punctuation}>,</span>}
        </span>
      </div>

      {open && container !== null && (
        <>
          <div id={contentId} className={css.children} role="group">
            {entries.map(([childName, childValue], index) => (
              <JsonNode
                key={childName}
                name={childName}
                value={childValue}
                depth={depth + 1}
                defaultExpandedDepth={defaultExpandedDepth}
                isLast={index === entries.length - 1}
                ancestors={nextAncestors}
              />
            ))}
          </div>
          <div className={css.row} aria-hidden="true">
            <span className={css.expanderPlaceholder} />
            <span className={css.summary}>
              <span className={css.punctuation}>{Array.isArray(container) ? ']' : '}'}</span>
              {!isLast && <span className={css.punctuation}>,</span>}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * JSON 树。
 *
 * 数据完全受控，展开状态由组件内部维护；根节点始终展开，
 * `defaultExpandedDepth` 控制嵌套层级，左右方向键可展开或收起当前节点。
 */
export function JsonTree({
  data,
  defaultExpandedDepth = 1,
  label = 'JSON',
  className,
}: JsonTreeProps) {
  const container = isContainer(data) ? data : null;
  const entries = container !== null ? entriesOf(container) : [];

  return (
    <div className={clsx(css.root, className)} role="tree" aria-label={label} data-json-tree="">
      {container === null ? (
        <div className={css.primitiveRow} role="treeitem">
          <PrimitiveValue value={data} />
        </div>
      ) : entries.length === 0 ? (
        <div className={css.primitiveRow} role="treeitem">
          <span className={css.punctuation}>{Array.isArray(container) ? '[]' : '{}'}</span>
        </div>
      ) : (
        <>
          <div className={css.bracket} aria-hidden="true">
            {Array.isArray(container) ? '[' : '{'}
          </div>
          <div className={css.children} role="group">
            {entries.map(([key, value], index) => (
              <JsonNode
                key={key}
                name={key}
                value={value}
                depth={1}
                defaultExpandedDepth={defaultExpandedDepth}
                isLast={index === entries.length - 1}
                ancestors={[container]}
              />
            ))}
          </div>
          <div className={css.bracket} aria-hidden="true">
            {Array.isArray(container) ? ']' : '}'}
          </div>
        </>
      )}
    </div>
  );
}
