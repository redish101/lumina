/** 本地键盘处理器的输入法组合生命周期，包含迟到的那一次收尾 keydown。 */

/**
 * 观察输入法组合状态，直到收尾键被释放或被消费。
 * @param document - 事件归属的文档。
 * @returns 事件守卫与摘除全部监听的函数。
 */
export function observeComposition(document: Document): {
  guards(event: KeyboardEvent): boolean;
  dispose(): void;
} {
  let composing = false;
  let ended = false;
  const start = (): void => {
    composing = true;
  };
  const end = (): void => {
    composing = false;
    ended = true;
  };
  const release = (): void => {
    ended = false;
  };
  const blur = (): void => {
    composing = false;
    ended = false;
  };
  document.addEventListener('compositionstart', start, true);
  document.addEventListener('compositionend', end, true);
  document.addEventListener('keyup', release, true);
  document.defaultView?.addEventListener('blur', blur);
  return {
    guards: (event) => {
      // 没有 isComposing 的引擎用 IME 的 keyCode 229 兜底。
      const guarded = composing || ended || event.isComposing || event.keyCode === 229;
      ended = false;
      return guarded;
    },
    dispose: () => {
      document.removeEventListener('compositionstart', start, true);
      document.removeEventListener('compositionend', end, true);
      document.removeEventListener('keyup', release, true);
      document.defaultView?.removeEventListener('blur', blur);
    },
  };
}
