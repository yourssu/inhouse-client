import type { PartNameType } from '@/apis/parts/schema';
import type { ValueOf } from '@/types/misc';

import { vars } from '@/styles/__generated__/colors.gen';

export const partNameKo = {
  'Head lead': '리드',
  Android: '안드로이드',
  Backend: '백엔드',
  Frontend: '프론트엔드',
  iOS: 'iOS',
  Marketing: '마케팅',
  'Product Design': '디자인',
  Finance: '회계',
  HR: 'HR',
  Legal: '리걸',
  PM: 'PM',
} as const satisfies Record<PartNameType, string>;

export const partColorMap = {
  'Head lead': { base: vars.red500, light: vars.red200 },
  Android: { base: vars.green500, light: vars.green300 },
  Backend: { base: vars.violet500, light: vars.violet200 },
  Frontend: { base: vars.blue500, light: vars.blue300 },
  iOS: { base: vars.orange500, light: vars.orange400 },
  Marketing: { base: vars.teal500, light: vars.teal200 },
  'Product Design': { base: vars.purple600, light: vars.purple200 },
  Finance: { base: vars.yellow500, light: vars.yellow300 },
  HR: { base: vars.yellow500, light: vars.yellow300 },
  Legal: { base: vars.grey500, light: vars.grey200 },
  PM: { base: vars.red500, light: vars.red200 },
} as const satisfies Record<
  PartNameType,
  {
    base: string;
    light: string;
  }
>;

export type PartNameKoType = ValueOf<typeof partNameKo>;
