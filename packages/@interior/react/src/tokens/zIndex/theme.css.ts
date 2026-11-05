import { createGlobalTheme } from '@vanilla-extract/css';

import { zIndex } from './contract';

createGlobalTheme(':root', zIndex, {
  content: '1',
  sticky: '100',
  modal: '200',
  dropdown: '300',
  popover: '400',
  tooltip: '450',
  notification: '500',
});
