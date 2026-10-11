import { vars } from '@interior/vars';
import { style } from '@vanilla-extract/css';

export const root = style({
  backgroundColor: vars.color.palette.greyOpacity100,
  width: 1,
  height: '100%',
  alignSelf: 'stretch',
});
