import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const root = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const list = style({
  display: 'flex',
  flexGrow: 1,
  flexWrap: 'wrap',
  columnGap: 20,
});

export const button = style({
  position: 'relative',
  width: 'fit-content',
  cursor: 'pointer',
  paddingTop: 10,
  paddingBottom: 10,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
});

export const label = recipe({
  base: {
    color: vars.color.grey800,
    ...typography['15'],
  },
  variants: {
    selected: {
      true: {
        fontWeight: 600,
      },
      false: {
        fontWeight: 500,
      },
    },
  },
});

export const indicator = style({
  backgroundColor: vars.color.grey800,
  position: 'absolute',
  bottom: 0,
  left: 0,
  height: 2,
  width: '100%',
});
