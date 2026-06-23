import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const container = recipe({
  base: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 10,
    border: '1px solid transparent',
  },
  variants: {
    variant: {
      dimmed: {
        backgroundColor: vars.color.greyOpacity100,
      },
      outline: {
        borderColor: vars.color.grey200,
        backgroundColor: 'transparent',
        transition: 'border-color 0.2s ease',
        selectors: {
          '&:focus-within': {
            borderColor: vars.color.violet500,
          },
          '&:hover:not(:focus-within)': {
            borderColor: vars.color.violetOpacity200,
          },
        },
      },
    },
    size: {
      md: {
        height: 32,
      },
      lg: {
        height: 38,
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
        height: 32,
        padding: 4,
      },
      lg: {
        height: 38,
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
    color: vars.color.greyOpacity800,
    width: '100%',
    backgroundColor: 'transparent',
    fontWeight: 500,
    border: 'none',
    outline: 'none',
    selectors: {
      '&::placeholder': {
        color: vars.color.greyOpacity500,
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
  color: vars.color.grey500,
  width: 16,
  height: 16,
  flexShrink: 0,
});

export const deleteIcon = style({
  width: 16,
  height: 16,
});

export const deleteButton = style({
  color: vars.color.greyOpacity500,
  display: 'flex',
  flexShrink: 0,
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 9999,
  transition: 'color 0.2s ease, background-color 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.greyOpacity100,
      color: vars.color.greyOpacity800,
    },
  },
});
