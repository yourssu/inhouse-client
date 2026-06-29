import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const root = style({
  width: '100%',
  border: 'none',
  padding: 0,
  margin: 0,
});

export const label = style({
  ...typography['15'],
  color: vars.color.fg.neutralMuted,
  paddingTop: 6,
  paddingBottom: 6,
  fontWeight: 'normal',
});

export const help = style({
  color: vars.color.fg.neutralSubtle,
  ...typography['13'],
  marginTop: 6,
  fontWeight: 'normal',
});
