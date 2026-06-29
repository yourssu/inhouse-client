import { vars } from '@yourssu-inhouse/interior-vars';

import type { DivisionNameType } from '@/apis/divisions/schema';

export const divisionColorMap = {
  디자인: vars.color.palette.red500,
  개발: vars.color.palette.blue500,
  운영: vars.color.palette.teal500,
} as const satisfies Record<DivisionNameType, string>;
