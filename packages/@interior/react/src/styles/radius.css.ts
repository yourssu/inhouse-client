import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';
import { vars as varsSource } from '@yourssu-inhouse/interior-vars';

import { interiorContract } from './utils/contract';

export const radius = createGlobalThemeContract(varsSource.radius, interiorContract);

createGlobalTheme(':root', radius, {
  0: '0',
  2: '2px',
  4: '4px',
  6: '6px',
  8: '8px',
  10: '10px',
  12: '12px',
  16: '16px',
  20: '20px',
  24: '24px',
  full: '9999px',
});
