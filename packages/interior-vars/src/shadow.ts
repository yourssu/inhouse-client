const primary = {
  shadowMedium00: 'var(--shadowMedium00)',
  shadowMedium01: 'var(--shadowMedium01)',
  shadowMedium02: 'var(--shadowMedium02)',
  shadowLarge00: 'var(--shadowLarge00)',
  shadowLarge01: 'var(--shadowLarge01)',
  shadowLarge02: 'var(--shadowLarge02)',
} as const;

const semantic = {
  dialog: 'var(--shadow-dialog)',
  buttonFocus: 'var(--shadow-buttonFocus)',
  select: 'var(--shadow-select)',
  switchThumb: 'var(--shadow-switchThumb)',
  tooltip: 'var(--shadow-tooltip)',
  selectOutline: 'var(--shadow-selectOutline)',
  selectOutlineHover: 'var(--shadow-selectOutlineHover)',
  segmentedControlIndicator: 'var(--shadow-segmentedControlIndicator)',
} as const;

export const shadow = { ...primary, ...semantic } as const;
