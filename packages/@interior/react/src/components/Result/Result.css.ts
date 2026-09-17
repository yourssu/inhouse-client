import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const figureWrapper = style({
  display: 'flex',
  minHeight: 84,
  alignItems: 'center',
  paddingTop: 20,
  paddingBottom: 20,
});

export const titleText = style({
  color: vars.color.fg.neutralMuted,
  ...typography['15'],
  textAlign: 'center',
  fontWeight: 600,
  whiteSpace: 'pre-wrap',
});

export const descriptionText = style({
  color: vars.color.fg.neutralSubtle,
  ...typography['13'],
  marginTop: 4,
  textAlign: 'center',
});
