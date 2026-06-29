import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

export const primitiveContent = style({
  zIndex: vars.zIndex.popover,
  outline: 'none',
});

export const popoverInner = style({
  backgroundColor: vars.color.bg.floatBackground,
  zIndex: 10,
  minWidth: 120,
  borderRadius: vars.radius[12],
  padding: 16,
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`,
});

export const trigger = style({
  outline: 'none',
});
