import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const textFieldStyle = recipe({
  base: {
    width: '100%',
    borderRadius: vars.radius[8],
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 0,
    paddingBottom: 0,
    outline: 0,
    border: '1px solid transparent',
    transition: 'colors 0.2s ease, box-shadow 0.2s ease',
    selectors: {
      '&:disabled': {
        backgroundColor: vars.color.palette.greyOpacity200,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      outline: {
        borderColor: vars.color.palette.grey200,
        selectors: {
          '&:focus': {
            borderColor: vars.color.palette.violet500,
          },
          '&:hover:not(:focus):not(:disabled)': {
            borderColor: vars.color.palette.violetOpacity200,
          },
          '&:disabled': {
            borderColor: vars.color.palette.greyOpacity50,
          },
        },
      },
      dimmed: {
        backgroundColor: vars.color.palette.greyOpacity100,
      },
    },
    size: {
      md: {
        height: vars.uniformHeight.md,
        ...typography.sm,
      },
      lg: {
        height: vars.uniformHeight.lg,
        ...typography['15'],
      },
    },
    invalid: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { variant: 'outline', invalid: true },
      style: {
        borderColor: vars.color.palette.red500,
        selectors: {
          '&:focus': {
            borderColor: vars.color.palette.red500,
          },
        },
      },
    },
    {
      variants: { variant: 'dimmed', invalid: true },
      style: {
        boxShadow: `0 0 0 1px ${vars.color.palette.red500}`,
      },
    },
  ],
  defaultVariants: {
    invalid: false,
    size: 'md',
    variant: 'outline',
  },
});
