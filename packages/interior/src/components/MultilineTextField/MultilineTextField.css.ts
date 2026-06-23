import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const textarea = recipe({
  base: {
    ...typography['15'],
    minHeight: 120,
    width: '100%',
    borderRadius: 8,
    border: '1px solid transparent',
    padding: 12,
    outline: 0,
    transition: 'colors 0.2s ease',
    selectors: {
      '&::placeholder': {
        color: vars.color.grey400,
      },
      '&:disabled': {
        borderColor: vars.color.grey50,
        backgroundColor: vars.color.grey100,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    invalid: {
      true: {
        borderColor: vars.color.red500,
        selectors: {
          '&:focus': {
            borderColor: vars.color.red500,
          },
        },
      },
      false: {
        borderColor: vars.color.grey200,
        selectors: {
          '&:focus': {
            borderColor: vars.color.violet500,
          },
          '&:hover:not(:focus):not(:disabled)': {
            borderColor: vars.color.violetOpacity200,
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
