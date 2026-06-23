import { style } from '@vanilla-extract/css';
import { vars } from '@yourssu-inhouse/interior-vars';

export const root = style({
  display: 'inline-block',
  cursor: 'pointer',
  borderRadius: 6,
  paddingLeft: 6,
  paddingRight: 6,
  transition: 'background-color 0.2s ease',
  backgroundColor: 'transparent',
  border: 'none',
  outline: 'none',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.greyOpacity100,
    },
    '&:focus-visible': {
      backgroundColor: vars.color.greyOpacity100,
    },
  },
});
