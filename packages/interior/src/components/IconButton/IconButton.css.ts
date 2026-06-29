import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

export const tooltip = style({
  paddingTop: 6,
  paddingBottom: 6,
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: vars.radius[6],
  fontWeight: 600,
});

export const button = recipe({
  base: {
    display: 'flex',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    selectors: {
      '&:hover:not(:disabled)': {
        backgroundColor: vars.color.palette.greyOpacity200,
      },
      '&:disabled': {
        color: vars.color.palette.greyOpacity400,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    size: {
      xxs: {
        width: 20,
        height: vars.uniformHeight.xxs,
        borderRadius: vars.radius[2],
      },
      xs: {
        width: 24,
        height: vars.uniformHeight.xs,
        borderRadius: vars.radius[2],
      },
      sm: {
        width: 28,
        height: vars.uniformHeight.sm,
        borderRadius: vars.radius[2],
      },
      md: {
        width: 32,
        height: vars.uniformHeight.md,
        borderRadius: vars.radius[6],
      },
      lg: {
        width: 38,
        height: vars.uniformHeight.lg,
        borderRadius: vars.radius[8],
      },
      xl: {
        width: 48,
        height: vars.uniformHeight.xl,
        borderRadius: vars.radius[12],
      },
      xxl: {
        width: 68,
        height: vars.uniformHeight.xxl,
        borderRadius: vars.radius[16],
      },
    },
    variant: {
      dimmed: {
        backgroundColor: vars.color.palette.greyOpacity100,
        selectors: {
          '&:disabled': {
            color: vars.color.palette.greyOpacity300,
          },
        },
      },
      inline: {},
    },
  },
});
