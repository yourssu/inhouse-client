import { style } from '@vanilla-extract/css';
import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const toastContainer = style({
  backgroundColor: vars.color.grey900,
  ...typography['15'],
  display: 'flex',
  width: 'fit-content',
  alignItems: 'center',
  borderRadius: 12,
  paddingTop: 4,
  paddingBottom: 4,
  paddingRight: 22,
  paddingLeft: 12,
  fontWeight: 500,
  color: '#ffffff',
  selectors: {
    '[data-theme="dark"] &': {
      backgroundColor: vars.color.backgroundLevel02,
    },
  },
});

export const lottieWrapper = recipe({
  base: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variants: {
    type: {
      error: {
        width: 34,
        height: 34,
        padding: 4,
      },
      success: {
        width: 34,
        height: 34,
      },
      default: {
        height: 34,
        width: 10,
      },
    },
  },
});

export const motionWrapper = style({
  position: 'fixed',
  top: 0,
  left: '50%',
  zIndex: 50,
  display: 'flex',
  width: 'fit-content',
  alignItems: 'center',
  justifyContent: 'center',
});
