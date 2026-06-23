import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '../../styles/typography.css.ts';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    width: 'fit-content',
    alignItems: 'center',
    borderRadius: 9999,
    paddingTop: 0,
    paddingBottom: 0,
    fontWeight: 500,
  },
  variants: {
    color: {
      blue: { backgroundColor: vars.color.blueOpacity50, color: vars.color.blue600 },
      green: { backgroundColor: vars.color.greenOpacity50, color: vars.color.green600 },
      grey: { backgroundColor: vars.color.greyOpacity50, color: vars.color.grey600 },
      red: { backgroundColor: vars.color.redOpacity50, color: vars.color.red600 },
      violet: { backgroundColor: vars.color.violet50, color: vars.color.violet600 },
      yellow: { backgroundColor: vars.color.yellow50, color: vars.color.yellow600 },
    },
    size: {
      xs: { height: 15, paddingLeft: 6, paddingRight: 6, fontSize: 9 },
      sm: { height: 20, paddingLeft: 6, paddingRight: 6, ...typography.tiny },
      md: { height: 24, paddingLeft: 8, paddingRight: 8, ...typography['13'] },
      lg: { height: 28, paddingLeft: 10, paddingRight: 10, ...typography.sm },
      xl: { height: 32, paddingLeft: 12, paddingRight: 12, ...typography['15'] },
    },
  },
});
