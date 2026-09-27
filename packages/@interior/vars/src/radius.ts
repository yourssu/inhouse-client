/**
 * Radius scale.
 * 키 = 픽셀 값이에요. 기존 interior borderRadius 하드코딩(6/8/10/14/16)과 대응해요.
 */
export const radius = {
  0: 'var(--radius-0)',
  2: 'var(--radius-2)',
  4: 'var(--radius-4)',
  6: 'var(--radius-6)',
  8: 'var(--radius-8)',
  10: 'var(--radius-10)',
  12: 'var(--radius-12)',
  16: 'var(--radius-16)',
  20: 'var(--radius-20)',
  24: 'var(--radius-24)',
  full: 'var(--radius-full)',
} as const;

export type Radius = keyof typeof radius;
