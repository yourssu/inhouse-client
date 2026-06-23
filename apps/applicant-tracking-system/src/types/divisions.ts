import type { DivisionNameType } from '@/apis/divisions/schema';

import { vars } from '@/styles/__generated__/colors.gen';

export const divisionColorMap = {
  디자인: vars.red500,
  개발: vars.blue500,
  운영: vars.teal500,
} as const satisfies Record<DivisionNameType, string>;
