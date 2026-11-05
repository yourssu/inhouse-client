/**
 * Z-index scale.
 * 의미-기반 글로벌 오버레이 레이어(content/sticky/modal/dropdown/popover/tooltip/notification)로, 매직 넘버를 방지해요.
 * modal은 dropdown/popover보다 낮아요 - 모달 내부에서 열리는 드롭다운/팝오버가 모달 위에 떠야 해요.
 * tooltip은 modal/dropdown/popover보다 높아요 - 모달이나 팝오버 내부에서 호버된 툴팁이 가려지면 안 돼요.
 * notification(toast)은 항상 최상위에 있어요.
 * 컴포넌트 내부 stacking(indicator/label 등)은 이 스케일에 포함하지 않아요.
 */
export const zIndex = {
  content: 'var(--z-index-content)',
  sticky: 'var(--z-index-sticky)',
  modal: 'var(--z-index-modal)',
  dropdown: 'var(--z-index-dropdown)',
  popover: 'var(--z-index-popover)',
  tooltip: 'var(--z-index-tooltip)',
  notification: 'var(--z-index-notification)',
} as const;

export type ZIndex = keyof typeof zIndex;
