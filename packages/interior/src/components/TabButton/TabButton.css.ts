import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const container = recipe({
  base: {
    display: 'flex',
    width: '100%',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    transition: 'background-color 0.2s ease, color 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
  },
  variants: {
    active: {
      true: {
        backgroundColor: vars.color.palette.greyOpacity100,
        color: vars.color.fg.neutral,
        fontWeight: 600,
      },
      false: {
        color: vars.color.fg.neutralMuted,
        fontWeight: 500,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.palette.greyOpacity100,
          },
        },
      },
    },
    size: {
      md: {
        height: vars.uniformHeight.md,
        borderRadius: vars.radius[6],
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: typography.sm.fontSize,
      },
      lg: {
        height: vars.uniformHeight.lg,
        borderRadius: vars.radius[8],
        paddingLeft: 14,
        paddingRight: 14,
        fontSize: typography['15'].fontSize,
      },
    },
  },
  defaultVariants: {
    active: false,
  },
});

export const iconWrapper = style({
  display: 'flex',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
});

export const label = style({
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'left',
});
