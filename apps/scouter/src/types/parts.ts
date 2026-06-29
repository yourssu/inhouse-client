import { vars } from '@yourssu-inhouse/interior-vars';

import type { PartNameType } from '@/apis/parts/schema';
import type { ValueOf } from '@/types/misc';

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
  'Head lead': { base: vars.color.palette.red500, light: vars.color.palette.red200 },
  Android: { base: vars.color.palette.green500, light: vars.color.palette.green300 },
  Backend: { base: vars.color.palette.violet500, light: vars.color.palette.violet200 },
  Frontend: { base: vars.color.palette.blue500, light: vars.color.palette.blue300 },
  iOS: { base: vars.color.palette.orange500, light: vars.color.palette.orange400 },
  Marketing: { base: vars.color.palette.teal500, light: vars.color.palette.teal200 },
  'Product Design': { base: vars.color.palette.purple600, light: vars.color.palette.purple200 },
  Finance: { base: vars.color.palette.yellow500, light: vars.color.palette.yellow300 },
  HR: { base: vars.color.palette.yellow500, light: vars.color.palette.yellow300 },
  Legal: { base: vars.color.palette.grey500, light: vars.color.palette.grey200 },
  PM: { base: vars.color.palette.red500, light: vars.color.palette.red200 },
} as const satisfies Record<
  PartNameType,
  {
    base: string;
    light: string;
  }
>;

export type PartNameKoType = ValueOf<typeof partNameKo>;
