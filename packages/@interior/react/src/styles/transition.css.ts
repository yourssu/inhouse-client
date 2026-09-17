import { createGlobalTheme, createGlobalThemeContract } from '@vanilla-extract/css';
import { vars as varsSource } from '@yourssu-inhouse/interior-vars';

import { interiorContract } from './utils/contract';

export const transitions = createGlobalThemeContract(
  varsSource.transition.timingFunction,
  interiorContract,
);

createGlobalTheme(':root', transitions, {
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
});
