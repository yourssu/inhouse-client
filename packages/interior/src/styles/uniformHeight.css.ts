import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';
import { vars as varsSource } from '@yourssu-inhouse/interior-vars';

import { interiorContract } from './utils/contract';

export const uniformHeight = createGlobalThemeContract(varsSource.uniformHeight, interiorContract);

createGlobalTheme(':root', uniformHeight, {
  xxs: '20px',
  xs: '24px',
  sm: '28px',
  md: '32px',
  lg: '38px',
  xl: '48px',
  xxl: '68px',
});
