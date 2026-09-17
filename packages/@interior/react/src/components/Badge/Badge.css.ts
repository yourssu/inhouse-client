import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

import { typography } from '@/styles/typography.css.ts';

export const badge = recipe({
  base: {
    display: 'inline-flex',
    width: 'fit-content',
    alignItems: 'center',
    borderRadius: vars.radius.full,
    paddingTop: 0,
    paddingBottom: 0,
    fontWeight: 500,
  },
  variants: {
    color: {
      blue: {
        backgroundColor: vars.color.palette.blueOpacity50,
        color: vars.color.palette.blue600,
      },
      green: {
        backgroundColor: vars.color.palette.greenOpacity50,
        color: vars.color.palette.green600,
      },
      grey: {
        backgroundColor: vars.color.palette.greyOpacity50,
        color: vars.color.palette.grey600,
      },
      red: { backgroundColor: vars.color.palette.redOpacity50, color: vars.color.palette.red600 },
      violet: { backgroundColor: vars.color.palette.violet50, color: vars.color.palette.violet600 },
      yellow: { backgroundColor: vars.color.palette.yellow50, color: vars.color.palette.yellow600 },
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
