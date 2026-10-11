import { vars } from '@interior/vars';
import { style } from '@vanilla-extract/css';

export const root = style({
  backgroundColor: vars.color.palette.greyOpacity100,
  height: 1,
  width: '100%',
});
