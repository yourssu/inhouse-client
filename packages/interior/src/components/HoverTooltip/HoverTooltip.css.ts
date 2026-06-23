import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const content = style({
  backgroundColor: vars.color.backgroundLevel02,
  ...typography['13'],
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`, // shadow-tooltip
  zIndex: 20,
  maxWidth: 240,
  borderRadius: 14,
  paddingLeft: 22,
  paddingRight: 22,
  paddingTop: 14,
  paddingBottom: 14,
  border: 'none',
  outline: 'none',
});

export const arrow = style({
  fill: vars.color.backgroundLevel02,
  height: 9,
  width: 16,
});
