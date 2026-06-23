import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const button = recipe({
  base: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    transition: 'background-color 0.2s ease, color 0.2s ease',
    border: 'none',
    outline: 'none',
    selectors: {
      '&:disabled': {
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    variant: {
      primary: {
        backgroundColor: vars.color.buttonPrimaryBackground,
        color: vars.color.buttonPrimaryColor,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.buttonPrimaryBackgroundHovered,
          },
          '&:disabled': {
            color: vars.color.buttonPrimaryColorDisabled,
            backgroundColor: vars.color.buttonPrimaryBackgroundDisabled,
          },
        },
      },
      secondary: {
        backgroundColor: vars.color.buttonSecondaryBackground,
        color: vars.color.buttonSecondaryColor,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.buttonSecondaryBackgroundHovered,
          },
          '&:disabled': {
            color: vars.color.buttonSecondaryColorDisabled,
            backgroundColor: vars.color.buttonSecondaryBackgroundDisabled,
          },
        },
      },
      subPrimary: {
        backgroundColor: vars.color.buttonSubPrimaryBackground,
        color: vars.color.buttonSubPrimaryColor,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.buttonSubPrimaryBackgroundHovered,
          },
          '&:disabled': {
            color: vars.color.buttonSubPrimaryColorDisabled,
            backgroundColor: vars.color.buttonSubPrimaryBackgroundDisabled,
          },
        },
      },
      transparent: {
        backgroundColor: vars.color.buttonTransparentBackground,
        color: vars.color.buttonTransparentColor,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.buttonTransparentBackgroundHovered,
          },
          '&:disabled': {
            color: vars.color.buttonTransparentColorDisabled,
            backgroundColor: vars.color.buttonTransparentBackgroundDisabled,
          },
        },
      },
    },
    size: {
      xxs: {
        height: 20,
        borderRadius: 6,
        paddingLeft: 6,
        paddingRight: 6,
        ...typography.tiny,
        fontWeight: 500,
      },
      xs: {
        height: 24,
        borderRadius: 6,
        paddingLeft: 8,
        paddingRight: 8,
        ...typography.xs,
        fontWeight: 500,
      },
      sm: {
        height: 28,
        borderRadius: 8,
        paddingLeft: 10,
        paddingRight: 10,
        ...typography['13'],
        fontWeight: 500,
      },
      md: {
        height: 32,
        borderRadius: 8,
        paddingLeft: 12,
        paddingRight: 12,
        ...typography.sm,
        fontWeight: 500,
      },
      lg: {
        height: 38,
        borderRadius: 10,
        paddingLeft: 16,
        paddingRight: 16,
        ...typography['15'],
        fontWeight: 500,
      },
      xl: {
        height: 48,
        borderRadius: 14,
        paddingLeft: 20,
        paddingRight: 20,
        ...typography['17'],
        fontWeight: 500,
      },
      xxl: {
        height: 68,
        borderRadius: 16,
        paddingLeft: 28,
        paddingRight: 28,
        ...typography['17'],
        fontWeight: 500,
      },
    },
  },
});

export const icon = style({
  transition: 'opacity 0.2s ease',
  selectors: {
    'button:disabled &': {
      opacity: 0.45,
    },
  },
});
