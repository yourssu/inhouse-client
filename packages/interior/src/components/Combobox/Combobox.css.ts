import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const trigger = recipe({
  base: {
    ...typography['15'],
    position: 'relative',
    display: 'flex',
    minHeight: 38,
    width: '100%',
    cursor: 'text',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    borderRadius: vars.radius[8],
    border: '1px solid transparent',
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 4,
    paddingBottom: 4,
    outline: 0,
    transition: 'colors 0.2s ease',
  },
  variants: {
    disabled: {
      true: {
        borderColor: vars.color.palette.grey50,
        backgroundColor: vars.color.palette.grey100,
        cursor: 'not-allowed',
      },
      false: {
        borderColor: vars.color.palette.grey200,
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
    invalid: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { disabled: false, invalid: true },
      style: {
        borderColor: vars.color.palette.red500,
      },
    },
  ],
  defaultVariants: {
    disabled: false,
    invalid: false,
  },
});

export const input = style({
  minWidth: 30,
  flex: 1,
  backgroundColor: 'transparent',
  paddingLeft: 4,
  border: 'none',
  outline: 'none',
  selectors: {
    '&::placeholder': {
      color: vars.color.palette.grey400,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});

export const popoverContent = style({
  zIndex: vars.zIndex.dropdown,
  width: 'var(--radix-popover-trigger-width)',
  outline: 'none',
});

export const menu = style({
  backgroundColor: vars.color.bg.floatBackground,
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`,
  maxHeight: 320,
  width: '100%',
  overflowY: 'auto',
  borderRadius: vars.radius[8],
  paddingTop: 8,
  paddingBottom: 8,
});

export const noResult = style({
  ...typography['15'],
  color: vars.color.palette.grey400,
  marginLeft: 8,
  marginRight: 8,
  minHeight: 40,
  padding: 8,
  fontWeight: 500,
  outline: 0,
});

export const chip = style({
  backgroundColor: vars.color.palette.greyOpacity100,
  display: 'flex',
  height: vars.uniformHeight.sm,
  alignItems: 'center',
  gap: 4,
  borderRadius: vars.radius[8],
  paddingLeft: 8,
  paddingRight: 8,
  paddingTop: 2,
  paddingBottom: 2,
  ...typography.sm,
  fontWeight: 500,
});

export const chipCloseButton = style({
  display: 'flex',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  padding: 2,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  transition: 'background-color 0.2s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.palette.greyOpacity200,
    },
  },
});

export const itemStyle = recipe({
  base: {
    ...typography['15'],
    marginLeft: 8,
    marginRight: 8,
    minHeight: 40,
    cursor: 'pointer',
    borderRadius: vars.radius[8],
    padding: 8,
    fontWeight: 500,
    outline: 0,
    transition: 'background-color 0.15s ease, color 0.15s ease',
  },
  variants: {
    highlighted: {
      true: {
        backgroundColor: vars.color.palette.greyOpacity100,
      },
    },
    selected: {
      true: {
        color: vars.color.palette.violet600,
      },
      false: {
        color: vars.color.palette.greyOpacity800,
      },
    },
  },
  defaultVariants: {
    highlighted: false,
    selected: false,
  },
});
