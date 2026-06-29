import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const container = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
});

export const header = style({
  display: 'flex',
  flexDirection: 'column',
});

export const headerInner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingBottom: 12,
  fontSize: typography.xl.fontSize,
  fontWeight: 'bold',
});

export const headerDivider = style({
  marginBottom: 8,
});

export const headerButton = style({
  color: vars.color.fg.neutralSubtle,
  fontSize: typography['15'].fontSize,
  fontWeight: 'normal',
});

export const body = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
});

export const item = style({
  fontSize: typography['15'].fontSize,
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  paddingTop: 8,
  paddingBottom: 8,
});

export const itemLabel = style({
  color: vars.color.fg.neutralSubtle,
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: 4,
});

export const itemValue = style({
  color: vars.color.fg.neutralMuted,
  fontWeight: 500,
});
