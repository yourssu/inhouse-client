import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

export const tooltip = style({
  paddingTop: 6,
  paddingBottom: 6,
  paddingLeft: 10,
  paddingRight: 10,
  borderRadius: 6,
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
        backgroundColor: vars.color.greyOpacity200,
      },
      '&:disabled': {
        color: vars.color.greyOpacity400,
        cursor: 'not-allowed',
      },
    },
  },
  variants: {
    size: {
      xxs: {
        width: 20,
        height: 20,
        borderRadius: 2,
      },
      xs: {
        width: 24,
        height: 24,
        borderRadius: 2,
      },
      sm: {
        width: 28,
        height: 28,
        borderRadius: 2,
      },
      md: {
        width: 32,
        height: 32,
        borderRadius: 6,
      },
      lg: {
        width: 38,
        height: 38,
        borderRadius: 8,
      },
      xl: {
        width: 48,
        height: 48,
        borderRadius: 12,
      },
      xxl: {
        width: 68,
        height: 68,
        borderRadius: 16,
      },
    },
    variant: {
      dimmed: {
        backgroundColor: vars.color.greyOpacity100,
        selectors: {
          '&:disabled': {
            color: vars.color.greyOpacity300,
          },
        },
      },
      inline: {},
    },
  },
});
