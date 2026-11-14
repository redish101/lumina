'use client';

/** 用于 Markdown 图片链接的被动、受容器约束的图片预览。 */
import { useState } from 'react';
import { IconLoadingOutline } from '../../icons';
import css from './image-preview.module.css';

/** `ImagePreview` 的 props。 */
export interface ImagePreviewProps {
  /** 图片地址 */
  src: string;
  /** 图片替代文本 */
  alt: string;
  /** 加载中的状态文案 */
  loadingLabel: string;
  /** 加载失败的状态文案 */
  failedLabel: string;
}

/**
 * 受容器约束的被动图片预览，供 Markdown 图片链接使用。
 *
 * 自带加载中与加载失败文案，不引入第二个可激活目标。
 */
export function ImagePreview({ src, alt, loadingLabel, failedLabel }: ImagePreviewProps) {
  // key 跟随 src：换图时重置内部加载状态，避免沿用上一张图的 ready/failed。
  return (
    <Preview key={src} src={src} alt={alt} loadingLabel={loadingLabel} failedLabel={failedLabel} />
  );
}

function Preview({ src, alt, loadingLabel, failedLabel }: ImagePreviewProps) {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  return (
    <span className={css.frame}>
      {state !== 'failed' && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className={css.image}
          data-ready={state === 'ready' || undefined}
          onLoad={() => {
            setState('ready');
          }}
          onError={() => {
            setState('failed');
          }}
        />
      )}
      {state !== 'ready' && (
        <span className={css.status} role="status">
          {state === 'loading' && <IconLoadingOutline size={16} />}
          <span>{state === 'loading' ? loadingLabel : failedLabel}</span>
        </span>
      )}
    </span>
  );
}
