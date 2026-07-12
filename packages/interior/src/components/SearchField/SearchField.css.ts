import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const container = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: vars.radius[10],
    border: '1px solid transparent',
  },
  variants: {
    variant: {
      dimmed: {
        backgroundColor: vars.color.palette.greyOpacity100,
      },
      outline: {
        borderColor: vars.color.palette.grey200,
        backgroundColor: 'transparent',
        transition: 'border-color 0.2s ease',
        selectors: {
          '&:focus-within': {
            borderColor: vars.color.palette.violet500,
          },
          '&:hover:not(:focus-within)': {
            borderColor: vars.color.palette.violetOpacity200,
          },
        },
      },
    },
    size: {
      md: {
        height: vars.uniformHeight.md,
      },
      lg: {
        height: vars.uniformHeight.lg,
      },
    },
  },
});

export const inputWrapper = recipe({
  base: {
    display: 'flex',
    flex: '1 1 0%',
    alignItems: 'center',
  },
  variants: {
    size: {
      md: {
        height: vars.uniformHeight.md,
        padding: 4,
      },
      lg: {
        height: vars.uniformHeight.lg,
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 7,
        paddingRight: 7,
      },
    },
  },
});

export const input = recipe({
  base: {
    color: vars.color.palette.greyOpacity800,
    width: '100%',
    backgroundColor: 'transparent',
    fontWeight: 500,
    border: 'none',
    outline: 'none',
    selectors: {
      '&::placeholder': {
        color: vars.color.palette.greyOpacity500,
      },
    },
  },
  variants: {
    size: {
      md: {
        ...typography.sm,
      },
      lg: {
        ...typography['15'],
      },
    },
  },
});

export const addon = recipe({
  base: {},
  variants: {
    size: {
      md: {
        padding: 4,
      },
      lg: {
        padding: 7,
      },
    },
    position: {
      left: {
        paddingRight: 0,
      },
      right: {
        paddingLeft: 0,
      },
    },
  },
});

export const iconWrapper = recipe({
  base: {},
  variants: {
    size: {
      md: {
        padding: 4,
      },
      lg: {
        paddingLeft: 3,
        paddingRight: 3,
        paddingTop: 4,
        paddingBottom: 4,
      },
    },
  },
});

export const searchIcon = style({
  color: vars.color.palette.grey500,
  width: 16,
  height: 16,
  flexShrink: 0,
});

export const deleteIcon = style({
  width: 16,
  height: 16,
});

export const deleteButton = style({
  color: vars.color.palette.greyOpacity500,
  display: 'flex',
  flexShrink: 0,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  transition: 'color 0.2s ease, background-color 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.palette.greyOpacity100,
      color: vars.color.palette.greyOpacity800,
    },
  },
});
