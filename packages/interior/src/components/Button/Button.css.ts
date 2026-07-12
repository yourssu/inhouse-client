import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

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
        backgroundColor: vars.color.palette.violet500,
        color: '#ffffff',
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.palette.violet600,
          },
          '&:disabled': {
            color: 'rgba(255, 255, 255, 0.45)',
            backgroundColor: vars.color.palette.violetOpacity200,
          },
        },
      },
      secondary: {
        backgroundColor: vars.color.palette.greyOpacity100,
        color: vars.color.palette.greyOpacity800,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.palette.greyOpacity200,
          },
          '&:disabled': {
            color: vars.color.palette.greyOpacity300,
            backgroundColor: vars.color.palette.greyOpacity100,
          },
        },
      },
      subPrimary: {
        backgroundColor: vars.color.palette.violetOpacity50,
        color: vars.color.palette.violet600,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.palette.violetOpacity100,
          },
          '&:disabled': {
            color: vars.color.palette.violetOpacity100,
            backgroundColor: vars.color.palette.violetOpacity50,
          },
        },
      },
      transparent: {
        backgroundColor: 'transparent',
        color: vars.color.palette.greyOpacity800,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.palette.greyOpacity100,
          },
          '&:disabled': {
            color: vars.color.palette.grey500,
            backgroundColor: 'transparent',
          },
        },
      },
    },
    size: {
      xxs: {
        height: vars.uniformHeight.xxs,
        borderRadius: vars.radius[6],
        paddingLeft: 6,
        paddingRight: 6,
        ...typography.tiny,
        fontWeight: 500,
      },
      xs: {
        height: vars.uniformHeight.xs,
        borderRadius: vars.radius[6],
        paddingLeft: 8,
        paddingRight: 8,
        ...typography.xs,
        fontWeight: 500,
      },
      sm: {
        height: vars.uniformHeight.sm,
        borderRadius: vars.radius[8],
        paddingLeft: 10,
        paddingRight: 10,
        ...typography['13'],
        fontWeight: 500,
      },
      md: {
        height: vars.uniformHeight.md,
        borderRadius: vars.radius[8],
        paddingLeft: 12,
        paddingRight: 12,
        ...typography.sm,
        fontWeight: 500,
      },
      lg: {
        height: vars.uniformHeight.lg,
        borderRadius: vars.radius[10],
        paddingLeft: 16,
        paddingRight: 16,
        ...typography['15'],
        fontWeight: 500,
      },
      xl: {
        height: vars.uniformHeight.xl,
        borderRadius: 14,
        paddingLeft: 20,
        paddingRight: 20,
        ...typography['17'],
        fontWeight: 500,
      },
      xxl: {
        height: vars.uniformHeight.xxl,
        borderRadius: vars.radius[16],
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
