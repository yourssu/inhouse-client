/**
 * Uniform control heights.
 * 기존 interior Button size variant의 height(20/24/28/32/38/48/68)과 1:1로 대응해요.
 * 컨트롤들이 동일 높이를 공유하게 해요.
 */
export const uniformHeight = {
  xxs: 'var(--uniform-height-xxs)',
  xs: 'var(--uniform-height-xs)',
  sm: 'var(--uniform-height-sm)',
  md: 'var(--uniform-height-md)',
  lg: 'var(--uniform-height-lg)',
  xl: 'var(--uniform-height-xl)',
  xxl: 'var(--uniform-height-xxl)',
} as const;

export type UniformHeight = keyof typeof uniformHeight;
