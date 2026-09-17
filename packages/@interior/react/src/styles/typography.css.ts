import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';
import { vars as varsSource } from '@yourssu-inhouse/interior-vars';

import { interiorContract } from './utils/contract';

export const typographies = createGlobalThemeContract(varsSource.typography, interiorContract);

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

export const typography = {
  tiny: {
    fontSize: typographies.fontSize.tiny,
    lineHeight: typographies.lineHeight.tiny,
  },
  xs: {
    fontSize: typographies.fontSize.xs,
    lineHeight: typographies.lineHeight.xs,
  },
  '13': {
    fontSize: typographies.fontSize[13],
    lineHeight: typographies.lineHeight['13'],
  },
  sm: {
    fontSize: typographies.fontSize.sm,
    lineHeight: typographies.lineHeight.sm,
  },
  '15': {
    fontSize: typographies.fontSize[15],
    lineHeight: typographies.lineHeight['15'],
  },
  base: {
    fontSize: typographies.fontSize.base,
    lineHeight: typographies.lineHeight.base,
  },
  '17': {
    fontSize: typographies.fontSize[17],
    lineHeight: typographies.lineHeight['17'],
  },
  lg: {
    fontSize: typographies.fontSize.lg,
    lineHeight: typographies.lineHeight.lg,
  },
  xl: {
    fontSize: typographies.fontSize.xl,
    lineHeight: typographies.lineHeight.xl,
  },
  '2xl': {
    fontSize: typographies.fontSize['2xl'],
    lineHeight: typographies.lineHeight['2xl'],
  },
  '3xl': {
    fontSize: typographies.fontSize['3xl'],
    lineHeight: typographies.lineHeight['3xl'],
  },
  '4xl': {
    fontSize: typographies.fontSize['4xl'],
    lineHeight: typographies.lineHeight['4xl'],
  },
  '5xl': {
    fontSize: typographies.fontSize['5xl'],
    lineHeight: typographies.lineHeight['5xl'],
  },
  '6xl': {
    fontSize: typographies.fontSize['6xl'],
    lineHeight: typographies.lineHeight['6xl'],
  },
  '7xl': {
    fontSize: typographies.fontSize['7xl'],
    lineHeight: typographies.lineHeight['7xl'],
  },
  '8xl': {
    fontSize: typographies.fontSize['8xl'],
    lineHeight: typographies.lineHeight['8xl'],
  },
  '9xl': {
    fontSize: typographies.fontSize['9xl'],
    lineHeight: typographies.lineHeight['9xl'],
  },
} as const;
