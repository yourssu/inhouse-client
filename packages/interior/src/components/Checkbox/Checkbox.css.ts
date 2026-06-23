import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const base = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const checkIcon = style({
  pointerEvents: 'none',
});

export const labelWrapper = style({
  display: 'flex',
  alignItems: 'center',
  ...typography.sm,
  fontWeight: 500,
});

export const labelText = style({
  color: vars.color.grey800,
});

export const button = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    transition: 'colors 0.2s ease-in-out',
    border: 'none',
    outline: 'none',
    selectors: {
      '&:disabled': {
        cursor: 'not-allowed',
        opacity: 0.5,
      },
    },
  },
  variants: {
    checked: {
      true: {
        backgroundColor: vars.color.violet500,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.violet600,
          },
        },
      },
      false: {
        border: `1px solid ${vars.color.greyOpacity300}`,
        backgroundColor: 'transparent',
        selectors: {
          '&:hover:not(:disabled)': {
            borderColor: vars.color.violet500,
            backgroundColor: vars.color.violetOpacity50,
          },
        },
      },
    },
  },
  defaultVariants: {
    checked: false,
  },
});
