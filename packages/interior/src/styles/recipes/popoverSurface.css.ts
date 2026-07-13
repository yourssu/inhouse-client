import { recipe } from '@vanilla-extract/recipes';
import { vars } from '@yourssu-inhouse/interior-vars';

export const popoverSurface = recipe({
  base: {
    backgroundColor: vars.color.bg.floatBackground,
    zIndex: 10,
    minWidth: 120,
    borderRadius: vars.radius[12],
    boxShadow: vars.shadow.popover,
  },
  variants: {
    padding: {
      xxs: { padding: 6 },
      xs: { padding: 8 },
      sm: { padding: 10 },
      md: { padding: 12 },
      lg: { padding: 16 },
      xl: { padding: 20 },
      xxl: { padding: 28 },
    },
  },
  defaultVariants: {
    padding: 'lg',
  },
});
