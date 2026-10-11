import { vars as varsSource } from '@interior/vars';
import { createGlobalThemeContract } from '@vanilla-extract/css';

import { interiorContract } from '../../utils/contract';

export const zIndex = createGlobalThemeContract(varsSource.zIndex, interiorContract);
