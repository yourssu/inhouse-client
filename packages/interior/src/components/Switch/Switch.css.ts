import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

export const base = recipe({
  base: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    cursor: 'pointer',
    alignItems: 'center',
    borderRadius: 9999,
    transition: 'background-color 0.2s ease-in-out',
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
        backgroundColor: vars.color.greyOpacity100,
        selectors: {
          '&:hover:not(:disabled)': {
            backgroundColor: vars.color.greyOpacity200,
          },
        },
      },
    },
    size: {
      sm: {
        height: 16,
        minWidth: 26,
      },
      md: {
        height: 20,
        minWidth: 34,
      },
      lg: {
        height: 24,
        minWidth: 42,
      },
      xl: {
        height: 28,
        minWidth: 50,
      },
    },
  },
  defaultVariants: {
    checked: false,
    size: 'md',
  },
});

export const thumb = recipe({
  base: {
    boxShadow: `0 0 0 1px ${vars.color.greyOpacity100}, 0 2px 4px 0 rgba(0, 0, 0, 0.18)`, // shadow-switch-thumb
    pointerEvents: 'none',
    margin: 2,
    display: 'block',
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s ease-in-out',
  },
  variants: {
    size: {
      sm: {
        width: 12,
        height: 12,
      },
      md: {
        width: 16,
        height: 16,
      },
      lg: {
        width: 20,
        height: 20,
      },
      xl: {
        width: 24,
        height: 24,
      },
    },
    checked: {
      true: {},
      false: {
        transform: 'translateX(0)',
      },
    },
  },
  compoundVariants: [
    {
      variants: { checked: true, size: 'sm' },
      style: {
        transform: 'translateX(10px)',
      },
    },
    {
      variants: { checked: true, size: 'md' },
      style: {
        transform: 'translateX(14px)',
      },
    },
    {
      variants: { checked: true, size: 'lg' },
      style: {
        transform: 'translateX(18px)',
      },
    },
    {
      variants: { checked: true, size: 'xl' },
      style: {
        transform: 'translateX(22px)',
      },
    },
  ],
  defaultVariants: {
    checked: false,
    size: 'md',
  },
});
