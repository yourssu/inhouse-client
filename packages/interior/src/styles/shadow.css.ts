import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';
import { vars as varsSource } from '@yourssu-inhouse/interior-vars';

import { vars } from './color.css';
import { interiorContract } from './utils/contract.ts';

export const shadows = createGlobalThemeContract(varsSource.shadow, interiorContract);

const semanticShadowTokens = {
  dialog: `0 0 0 1px ${shadows.shadowLarge00}, 0 10px 40px 0 ${shadows.shadowLarge01}, 0 20px 50px 0 ${shadows.shadowLarge02}, 2px 70px 80px 0 ${shadows.shadowLarge02}`,
  buttonFocus: `inset 0 0 0 1px ${vars.palette.greyOpacity800}, inset 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 4px 4px ${vars.palette.greyOpacity200}`,
  select: `0 0 0 1px ${shadows.shadowMedium00}, 0 10px 30px 0 ${shadows.shadowMedium01}, 0 20px 40px 0 ${shadows.shadowMedium02}`,
  switchThumb: `0 0 0 1px ${vars.palette.greyOpacity100}, 0 2px 4px 0 rgba(0, 0, 0, 0.18)`,
  tooltip: `0 0 0 1px ${shadows.shadowMedium00}, 0 10px 30px 0 ${shadows.shadowMedium01}, 0 20px 40px 0 ${shadows.shadowMedium02}`,
  selectOutline: `inset 0 0 0 1px ${vars.palette.grey200}`,
  selectOutlineHover: `inset 0 0 0 1px ${vars.palette.violetOpacity200}`,
  segmentedControlIndicator: `${vars.palette.greyOpacity200} 0px 1px 3px 0px`,
} as const;

const lightShadowTokens = {
  shadowMedium00: 'rgba(2, 32, 71, 0.05)',
  shadowMedium01: 'rgba(2, 32, 71, 0.05)',
  shadowMedium02: 'rgba(0, 23, 51, 0.02)',
  shadowLarge00: 'rgba(2, 32, 71, 0.05)',
  shadowLarge01: 'rgba(2, 32, 71, 0.05)',
  shadowLarge02: 'rgba(0, 23, 51, 0.02)',
  ...semanticShadowTokens,
} as const;

const darkShadowTokens = {
  shadowMedium00: 'rgba(222, 222, 255, 0.19)',
  shadowMedium01: 'rgba(0, 0, 0, 0.15)',
  shadowMedium02: 'rgba(0, 0, 0, 0.12)',
  shadowLarge00: 'rgba(222, 222, 255, 0.19)',
  shadowLarge01: 'rgba(0, 0, 0, 0.15)',
  shadowLarge02: 'rgba(0, 0, 0, 0.12)',
  ...semanticShadowTokens,
} as const;

createGlobalTheme(':root, [data-theme="light"]', shadows, lightShadowTokens);
createGlobalTheme('[data-theme="dark"]', shadows, darkShadowTokens);
