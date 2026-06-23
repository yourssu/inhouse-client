import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

export const paginationContainer = style({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

export const ellipsis = style({
  color: vars.color.greyOpacity500,
  display: 'flex',
  height: 32,
  width: 32,
  alignItems: 'center',
  justifyContent: 'center',
});

export const navButtonRecipe = recipe({
  base: {
    color: vars.color.greyOpacity500,
    display: 'flex',
    height: 32,
    width: 32,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    outline: 'none',
  },
  variants: {
    disabled: {
      true: {
        color: vars.color.greyOpacity300,
        cursor: 'not-allowed',
      },
      false: {
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.greyOpacity100,
            color: vars.color.greyOpacity600,
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
    height: 32,
    width: 32,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    fontSize: 14,
    fontWeight: 500,
    border: 'none',
    backgroundColor: 'transparent',
    padding: 0,
    outline: 'none',
  },
  variants: {
    variant: {
      default: {
        color: vars.color.greyOpacity600,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.greyOpacity100,
          },
        },
      },
      active: {
        backgroundColor: vars.color.greyOpacity100,
        color: vars.color.greyOpacity800,
      },
      disabled: {
        color: vars.color.greyOpacity400,
        cursor: 'not-allowed',
      },
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
