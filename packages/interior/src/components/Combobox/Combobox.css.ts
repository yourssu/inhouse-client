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
    borderRadius: 8,
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
        borderColor: vars.color.grey50,
        backgroundColor: vars.color.grey100,
        cursor: 'not-allowed',
      },
      false: {
        borderColor: vars.color.grey200,
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
    invalid: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      variants: { disabled: false, invalid: true },
      style: {
        borderColor: vars.color.red500,
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
      color: vars.color.grey400,
    },
    '&:disabled': {
      cursor: 'not-allowed',
    },
  },
});

export const popoverContent = style({
  zIndex: 50,
  width: 'var(--radix-popover-trigger-width)',
  outline: 'none',
});

export const menu = style({
  backgroundColor: vars.color.floatBackground,
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`,
  maxHeight: 320,
  width: '100%',
  overflowY: 'auto',
  borderRadius: 8,
  paddingTop: 8,
  paddingBottom: 8,
});

export const noResult = style({
  ...typography['15'],
  color: vars.color.grey400,
  marginLeft: 8,
  marginRight: 8,
  minHeight: 40,
  padding: 8,
  fontWeight: 500,
  outline: 0,
});

export const chip = style({
  backgroundColor: vars.color.greyOpacity100,
  display: 'flex',
  height: 28,
  alignItems: 'center',
  gap: 4,
  borderRadius: 8,
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
  borderRadius: 9999,
  padding: 2,
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  transition: 'background-color 0.2s ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.greyOpacity200,
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
    borderRadius: 8,
    padding: 8,
    fontWeight: 500,
    outline: 0,
    transition: 'background-color 0.15s ease, color 0.15s ease',
  },
  variants: {
    highlighted: {
      true: {
        backgroundColor: vars.color.greyOpacity100,
      },
    },
    selected: {
      true: {
        color: vars.color.violet600,
      },
      false: {
        color: vars.color.greyOpacity800,
      },
    },
  },
  defaultVariants: {
    highlighted: false,
    selected: false,
  },
});
