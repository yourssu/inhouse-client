/**
 * Transition timing function scale.
 * 키 = Tailwind transitionTimingFunction theme 키와 대응해요.
 */
export const transition = {
  timingFunction: {
    ease: 'var(--ease-ease)',
  },
} as const;

export type TransitionTimingFunction = keyof typeof transition.timingFunction;
