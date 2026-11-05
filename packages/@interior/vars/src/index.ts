import { color } from './color';
import { radius } from './radius';
import { shadow } from './shadow';
import { transition } from './transition';
import { typography } from './typography';
import { uniformHeight } from './uniformHeight';
import { zIndex } from './zIndex';

export const vars = {
  color,
  shadow,
  typography,
  transition,
  radius,
  uniformHeight,
  zIndex,
} as const;

export type { Radius } from './radius';
export type { TransitionTimingFunction } from './transition';
export type { UniformHeight } from './uniformHeight';
export type { ZIndex } from './zIndex';
