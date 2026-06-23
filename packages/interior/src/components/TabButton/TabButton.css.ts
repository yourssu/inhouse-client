import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

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
        backgroundColor: vars.color.greyOpacity100,
        color: vars.color.neutral,
        fontWeight: 600,
      },
      false: {
        color: vars.color.neutralMuted,
        fontWeight: 500,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.greyOpacity100,
          },
        },
      },
    },
    size: {
      md: {
        height: 32,
        borderRadius: 6,
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: 14,
      },
      lg: {
        height: 38,
        borderRadius: 8,
        paddingLeft: 14,
        paddingRight: 14,
        fontSize: 15,
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
