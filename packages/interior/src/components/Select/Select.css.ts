import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const trigger = recipe({
  base: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    transition:
      'background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
    selectors: {
      '&:disabled': {
        color: vars.color.greyOpacity300,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      outline: {
        boxShadow: `inset 0 0 0 1px ${vars.color.grey200}`,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 11,
        paddingLeft: 16,
        selectors: {
          '&:enabled:hover': {
            boxShadow: `inset 0 0 0 1px ${vars.color.violetOpacity200}`,
          },
        },
      },
      dimmed: {
        backgroundColor: vars.color.greyOpacity100,
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 11,
        paddingLeft: 16,
        selectors: {
          '&:enabled:hover': {
            backgroundColor: vars.color.greyOpacity200,
          },
        },
      },
      inline: {
        selectors: {
          '&:enabled:hover': {
            backgroundColor: vars.color.buttonTransparentBackgroundHovered,
          },
        },
      },
    },
    size: {
      xs: {
        ...typography['13'],
        height: 24,
        paddingRight: 4,
        paddingLeft: 10,
      },
      sm: {
        ...typography['13'],
        height: 28,
        paddingRight: 6,
        paddingLeft: 12,
      },
      md: {
        ...typography.sm,
        height: 32,
        paddingRight: 8,
        paddingLeft: 12,
      },
      lg: {
        ...typography['15'],
        height: 38,
        paddingRight: 11,
        paddingLeft: 16,
      },
    },
    hasValue: {
      true: {
        color: vars.color.greyOpacity800,
      },
      false: {
        color: vars.color.grey400,
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
        boxShadow: `inset 0 0 0 1px ${vars.color.red500}`,
        selectors: {
          '&:enabled:hover': {
            boxShadow: `inset 0 0 0 1px ${vars.color.red500}`,
          },
        },
      },
    },
    {
      variants: { variant: 'dimmed', invalid: true },
      style: {
        boxShadow: `inset 0 0 0 1px ${vars.color.red500}`,
      },
    },
  ],
  defaultVariants: {
    variant: 'inline',
    invalid: false,
  },
});

export const triggerIcon = style({
  color: vars.color.neutralDisabled,
  marginLeft: 4,
  display: 'flex',
  alignItems: 'center',
  selectors: {
    'button:disabled &': {
      color: vars.color.greyOpacity300,
    },
  },
});

export const viewport = style({
  backgroundColor: vars.color.floatBackground,
  boxShadow: `0 0 0 1px ${vars.shadow.shadowMedium00}, 0 10px 30px 0 ${vars.shadow.shadowMedium01}, 0 20px 40px 0 ${vars.shadow.shadowMedium02}`,
  maxHeight: 320,
  width: '100%',
  minWidth: 120,
  borderRadius: 8,
  paddingTop: 8,
  paddingBottom: 8,
});

export const selectItem = recipe({
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
    display: 'flex',
    alignItems: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    selectors: {
      '&:hover': {
        backgroundColor: vars.color.greyOpacity100,
      },
    },
  },
  variants: {
    selected: {
      true: {
        color: vars.color.violet600,
      },
      false: {
        color: vars.color.greyOpacity800,
      },
    },
  },
});

export const selectContent = style({
  zIndex: 50,
});
