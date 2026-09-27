import { vars } from '@interior/vars';
import { style } from '@vanilla-extract/css';

export const primitiveContent = style({
  zIndex: vars.zIndex.popover,
  outline: 'none',
});

export const trigger = style({
  outline: 'none',
});
