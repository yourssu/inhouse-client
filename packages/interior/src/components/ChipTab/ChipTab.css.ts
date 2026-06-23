import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const container = style({
  display: 'flex',
  width: '100%',
  alignItems: 'center',
});

export const list = style({
  display: 'flex',
  flexWrap: 'wrap',
});

export const item = recipe({
  base: {
    ...typography['15'],
    position: 'relative',
    height: 38,
    cursor: 'pointer',
    borderRadius: 9999,
    paddingLeft: 16,
    paddingRight: 16,
    transition: 'color 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  variants: {
    selected: {
      true: {
        color: vars.color.greyOpacity800,
        fontWeight: 600,
      },
      false: {
        color: vars.color.greyOpacity600,
      },
    },
  },
});

export const indicator = style({
  backgroundColor: vars.color.greyOpacity100,
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: 9999,
});

export const label = style({
  position: 'relative',
  zIndex: 10,
});
