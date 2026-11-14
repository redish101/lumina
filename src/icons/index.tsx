/**
 * 内联的 16px 产品图标。
 *
 * 上游用 `<use href="#dsw-icon-…">` 指向 ui-theme 维护的 sprite；这里没有那层运行时，
 * 所以把路径直接内联进来：颜色跟随 `currentColor`，尺寸用 `size`（缺省为该图形自身的绘制尺寸）。
 */

/** 图标组件的公共 props。 */
export interface IconProps {
  /** 正方形边长（px）；缺省为该图标的绘制尺寸。 */
  size?: number;
  /** 额外的类名；颜色跟随 `currentColor`。 */
  className?: string;
}

/** `IconCheckOutline`。 */
export const IconCheckOutline = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M2.25 8.5L5.49732 11.7473C5.90519 12.1552 6.57263 12.1344 6.95426 11.7018L13.75 4"
      stroke="currentColor"
    />
  </svg>
);

/** `IconCheckCircleOutline`。 */
export const IconCheckCircleOutline = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12.5303 6.53027L8.80273 10.2578C8.54967 10.5109 8.31796 10.7439 8.10645 10.9141C7.88375 11.0932 7.616 11.2602 7.27344 11.3145C7.09229 11.3431 6.90771 11.3431 6.72656 11.3145C6.384 11.2602 6.11625 11.0932 5.89355 10.9141C5.68204 10.7439 5.45033 10.5109 5.19727 10.2578L3.46973 8.53027L4.53027 7.46973L6.25781 9.19727C6.53457 9.47402 6.70036 9.63859 6.83398 9.74609C6.95637 9.84453 6.98241 9.83644 6.96094 9.83301C6.98679 9.83709 7.01321 9.83709 7.03906 9.83301C7.01759 9.83644 7.04363 9.84453 7.16602 9.74609C7.29964 9.63859 7.46543 9.47402 7.74219 9.19727L11.4697 5.46973L12.5303 6.53027Z"
      fill="currentColor"
    />
    <path
      d="M14.5996 8C14.5996 4.35492 11.6451 1.40039 8 1.40039C4.35492 1.40039 1.40039 4.35492 1.40039 8C1.40039 11.6451 4.35492 14.5996 8 14.5996C11.6451 14.5996 14.5996 11.6451 14.5996 8ZM15.9004 8C15.9004 12.363 12.363 15.9004 8 15.9004C3.63695 15.9004 0.0996094 12.363 0.0996094 8C0.0996094 3.63695 3.63695 0.0996094 8 0.0996094C12.363 0.0996094 15.9004 3.63695 15.9004 8Z"
      fill="currentColor"
    />
  </svg>
);

/** `IconChevronDownOutline`。 */
export const IconChevronDownOutline = ({ size = 14, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M4 6L7.29289 9.29289C7.68342 9.68342 8.31658 9.68342 8.70711 9.29289L12 6"
      stroke="currentColor"
    />
  </svg>
);

/** `IconChevronLeftOutline`。 */
export const IconChevronLeftOutline = ({ size = 14, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M10 4L6.70711 7.29289C6.31658 7.68342 6.31658 8.31658 6.70711 8.70711L10 12"
      stroke="currentColor"
    />
  </svg>
);

/** `IconChevronRightOutline`。 */
export const IconChevronRightOutline = ({ size = 14, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M6 12L9.29289 8.70711C9.68342 8.31658 9.68342 7.68342 9.29289 7.29289L6 4"
      stroke="currentColor"
    />
  </svg>
);

/** `IconCloseOutline`。 */
export const IconCloseOutline = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M2.5 2.5L13.5 13.5" stroke="currentColor" />
    <path d="M13.5 2.5L2.5 13.5" stroke="currentColor" />
  </svg>
);

/** `IconLoadingOutline`。 */
export const IconLoadingOutline = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path
      d="M12.596 12.596C11.687 13.5049 10.5288 14.1239 9.26798 14.3747C8.00716 14.6255 6.70028 14.4968 5.51261 14.0048C4.32494 13.5129 3.30981 12.6798 2.59557 11.611C1.88134 10.5421 1.50008 9.2855 1.5 7.99998C1.50008 6.71446 1.88134 5.45783 2.59557 4.38898C3.30981 3.32013 4.32494 2.48707 5.51261 1.99513C6.70028 1.50319 8.00716 1.37447 9.26798 1.62524C10.5288 1.87602 11.687 2.49502 12.596 3.40398"
      stroke="currentColor"
    />
  </svg>
);

/** `IconPlusOutline`。 */
export const IconPlusOutline = ({ size = 16, className }: IconProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth={1}
    width={size}
    height={size}
    className={className}
    aria-hidden="true"
  >
    <path d="M8 2V14" stroke="currentColor" />
    <path d="M2 8H14" stroke="currentColor" />
  </svg>
);
