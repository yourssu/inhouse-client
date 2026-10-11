import { createGlobalTheme } from '@vanilla-extract/css';

import { uniformHeight } from './contract';

createGlobalTheme(':root', uniformHeight, {
  xxs: '20px',
  xs: '24px',
  sm: '28px',
  md: '32px',
  lg: '38px',
  xl: '48px',
  xxl: '68px',
});
