/** 本库还没有 Modal，菜单把「是否被模态层遮挡」当作永远为否。 */
export function isBehindModal(anchor?: HTMLElement | null): boolean {
  // 参数保留成上游的签名，方便将来接入模态层栈。
  void anchor;
  return false;
}
