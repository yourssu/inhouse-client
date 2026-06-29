import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const paginationContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const ellipsis = style({
  color: vars.color.palette.greyOpacity500,
  display: 'flex',
  height: vars.uniformHeight.md,
  width: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

export const navButtonRecipe = recipe({
  base: {
    color: vars.color.palette.greyOpacity500,
    display: 'flex',
    height: vars.uniformHeight.md,
    width: 32,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.radius.full,
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    outline: 'none',
  },
  variants: {
    disabled: {
      true: {
        color: vars.color.palette.greyOpacity300,
        cursor: 'not-allowed',
      },
      false: {
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.palette.greyOpacity100,
            color: vars.color.palette.greyOpacity600,
          },
        },
      },
    },
  },
  defaultVariants: {
    disabled: false,
  },
});

export const pageButtonRecipe = recipe({
  base: {
    display: 'flex',
    height: vars.uniformHeight.md,
    width: 32,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: vars.radius.full,
    fontSize: typography.sm.fontSize,
    fontWeight: 500,
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    outline: 'none',
  },
  variants: {
    variant: {
      default: {
        color: vars.color.palette.greyOpacity600,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.palette.greyOpacity100,
          },
        },
      },
      active: {
        backgroundColor: vars.color.palette.greyOpacity100,
        color: vars.color.palette.greyOpacity800,
      },
      disabled: {
        color: vars.color.palette.greyOpacity400,
        cursor: 'not-allowed',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
