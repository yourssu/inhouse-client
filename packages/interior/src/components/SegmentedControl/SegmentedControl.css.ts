import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const root = style({
  backgroundColor: vars.color.palette.greyOpacity100,
  display: 'flex',
  height: vars.uniformHeight.md,
  width: 'auto',
  alignItems: 'center',
  borderRadius: vars.radius[8],
  padding: 2,
});

export const button = style({
  position: 'relative',
  display: 'inline-flex',
  height: '100%',
  minWidth: 28,
  flex: '1 0 auto',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius[6],
  paddingLeft: 6,
  paddingRight: 6,
  ...typography.sm,
  fontWeight: 500,
  transition: 'colors 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
});

export const indicator = style({
  backgroundColor: vars.color.bg.backgroundLevel04,
  boxShadow: '0px 1px 2px 0px rgba(0, 27, 55, 0.1)',
  position: 'absolute',
  inset: 0,
  top: 0,
  left: 0,
  zIndex: 0,
  borderRadius: vars.radius[8],
});

export const label = style({
  transition: 'color 0.2s ease',
  position: 'relative',
  zIndex: 10,
  flexShrink: 0,
  paddingLeft: 4,
  paddingRight: 4,
});

export const labelSelected = style({
  color: vars.color.palette.greyOpacity800,
});

export const labelUnselected = style({
  color: vars.color.palette.greyOpacity600,
});
