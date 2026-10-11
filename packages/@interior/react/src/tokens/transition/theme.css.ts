import { createGlobalTheme } from '@vanilla-extract/css';

import { transitions } from './contract';

createGlobalTheme(':root', transitions, {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
});
