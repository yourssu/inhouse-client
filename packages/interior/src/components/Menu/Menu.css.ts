import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const buttonItem = style({
  color: vars.color.palette.greyOpacity800,
  ...typography['15'],
  cursor: 'pointer',
  borderRadius: vars.radius[8],
  padding: 8,
  fontWeight: 500,
  transition: 'background-color 0.2s ease, color 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  display: 'block',
  width: '100%',
  textAlign: 'inherit',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.palette.greyOpacity100,
    },
  },
});

export const buttonItemInner = style({
  display: 'flex',
  alignItems: 'center',
});

export const iconWrapper = style({
  color: vars.color.palette.greyOpacity500,
  ...typography.base,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const label = recipe({
  base: {
    flex: '1 1 0%',
    paddingLeft: 6,
    paddingRight: 6,
  },
  variants: {
    hasIcon: {
      true: {
        textAlign: 'left',
      },
    },
  },
});

export const contentInner = style({
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
});
