import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

export const root = style({
  backgroundColor: vars.color.palette.greyOpacity100,
  width: 1,
  height: '100%',
  alignSelf: 'stretch',
});
