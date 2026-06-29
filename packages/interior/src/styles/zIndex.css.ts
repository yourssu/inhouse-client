import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';
import { vars as varsSource } from '@yourssu-inhouse/interior-vars';

import { interiorContract } from './utils/contract';

export const zIndex = createGlobalThemeContract(varsSource.zIndex, interiorContract);

createGlobalTheme(':root', zIndex, {
  content: '1',
  sticky: '100',
  dropdown: '200',
  popover: '300',
  notification: '400',
});
