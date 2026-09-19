import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { shadows } from '@/styles/shadow.css.ts';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  zIndex: vars.zIndex.modal,
});

export const content = style({
  position: 'fixed',
  top: 0,
  bottom: 0,
  left: 0,
  width: 320,
  maxWidth: '100vw',
  outline: 'none',
  zIndex: vars.zIndex.modal,
});

export const panel = style({
  backgroundColor: vars.color.bg.backgroundLevel02,
  boxShadow: shadows.dialog,
  height: '100%',
  overflow: 'hidden',
  borderTopRightRadius: vars.radius[16],
  borderBottomRightRadius: vars.radius[16],
  willChange: 'transform',
});
