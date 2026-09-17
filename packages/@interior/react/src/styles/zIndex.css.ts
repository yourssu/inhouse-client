import { vars as varsSource } from '@interior/vars';
import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';

import { interiorContract } from './utils/contract';

export const zIndex = createGlobalThemeContract(varsSource.zIndex, interiorContract);

createGlobalTheme(':root', zIndex, {
  content: '1',
  sticky: '100',
  modal: '200',
  dropdown: '300',
  popover: '400',
  tooltip: '450',
  notification: '500',
});
