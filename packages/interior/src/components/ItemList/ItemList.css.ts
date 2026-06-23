import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

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
  fontSize: 20,
  fontWeight: 'bold',
});

export const headerDivider = style({
  marginBottom: 8,
});

export const headerButton = style({
  color: vars.color.neutralSubtle,
  fontSize: 15,
  fontWeight: 'normal',
});

export const body = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
});

export const item = style({
  fontSize: 15,
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 24,
  paddingTop: 8,
  paddingBottom: 8,
});

export const itemLabel = style({
  color: vars.color.neutralSubtle,
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  gap: 4,
});

export const itemValue = style({
  color: vars.color.neutralMuted,
  fontWeight: 500,
});
