import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

export const root = style({
  backgroundColor: vars.color.palette.greyOpacity100,
  height: 1,
  width: '100%',
});
