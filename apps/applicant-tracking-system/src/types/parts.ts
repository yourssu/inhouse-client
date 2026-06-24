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
  'Head lead': { base: vars.color.red500, light: vars.color.red200 },
  Android: { base: vars.color.green500, light: vars.color.green300 },
  Backend: { base: vars.color.violet500, light: vars.color.violet200 },
  Frontend: { base: vars.color.blue500, light: vars.color.blue300 },
  iOS: { base: vars.color.orange500, light: vars.color.orange400 },
  Marketing: { base: vars.color.teal500, light: vars.color.teal200 },
  'Product Design': { base: vars.color.purple600, light: vars.color.purple200 },
  Finance: { base: vars.color.yellow500, light: vars.color.yellow300 },
  HR: { base: vars.color.yellow500, light: vars.color.yellow300 },
  Legal: { base: vars.color.grey500, light: vars.color.grey200 },
  PM: { base: vars.color.red500, light: vars.color.red200 },
} as const satisfies Record<
  PartNameType,
  {
    base: string;
    light: string;
  }
>;

export type PartNameKoType = ValueOf<typeof partNameKo>;
