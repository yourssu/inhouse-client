import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const textarea = recipe({
  base: {
    ...typography['15'],
    minHeight: 120,
    width: '100%',
    borderRadius: vars.radius[8],
    border: '1px solid transparent',
    padding: 12,
    outline: 0,
    transition: 'colors 0.2s ease',
    selectors: {
      '&::placeholder': {
        color: vars.color.palette.grey400,
      },
      '&:disabled': {
        borderColor: vars.color.palette.grey50,
        backgroundColor: vars.color.palette.grey100,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    invalid: {
      true: {
        borderColor: vars.color.palette.red500,
        selectors: {
          '&:focus': {
            borderColor: vars.color.palette.red500,
          },
        },
      },
      false: {
        borderColor: vars.color.palette.grey200,
        selectors: {
          '&:focus': {
            borderColor: vars.color.palette.violet500,
          },
          '&:hover:not(:focus):not(:disabled)': {
            borderColor: vars.color.palette.violetOpacity200,
          },
        },
      },
    },
    resizeNone: {
      true: {
        resize: 'none',
      },
    },
  },
  defaultVariants: {
    invalid: false,
    resizeNone: false,
  },
});
