/**
 * Z-index scale.
 * 의미-기반 글로벌 오버레이 레이어(content/sticky/dropdown/popover/notification)로, 매직 넘버를 방지해요.
 * 컴포넌트 내부 stacking(indicator/label 등)은 이 스케일에 포함하지 않아요.
 */
export const zIndex = {
  content: 'var(--z-index-content)',
  sticky: 'var(--z-index-sticky)',
  dropdown: 'var(--z-index-dropdown)',
  popover: 'var(--z-index-popover)',
  notification: 'var(--z-index-notification)',
} as const;

export type ZIndex = keyof typeof zIndex;