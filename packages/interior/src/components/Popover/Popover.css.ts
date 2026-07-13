import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

export const primitiveContent = style({
  zIndex: vars.zIndex.popover,
  outline: 'none',
});

export const trigger = style({
  outline: 'none',
});
