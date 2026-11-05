import { vars as varsSource } from '@interior/vars';
import { createGlobalThemeContract } from '@vanilla-extract/css';

import { interiorContract } from '../../utils/contract';

export const transitions = createGlobalThemeContract(
  varsSource.transition.timingFunction,
  interiorContract,
);
