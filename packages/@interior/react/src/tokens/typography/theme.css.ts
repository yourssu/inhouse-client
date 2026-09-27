import { createGlobalTheme } from '@vanilla-extract/css';

import { typographies } from './contract';

createGlobalTheme(':root', typographies, {
  fontSize: {
    tiny: '11px',
    xs: '12px',
    13: '13px',
    sm: '14px',
    15: '15px',
    base: '16px',
    17: '17px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },
  lineHeight: {
    tiny: '1.45',
    xs: '1.45',
    '13': '1.45',
    sm: '1.45',
    15: '1.45',
    base: '1.45',
    17: '1.45',
    lg: '1.45',
    xl: '1.45',
    '2xl': '1.45',
    '3xl': '1.45',
    '4xl': '1.45',
    '5xl': '1.45',
    '6xl': '1.45',
    '7xl': '1.45',
    '8xl': '1.45',
    '9xl': '1.45',
  },
});
