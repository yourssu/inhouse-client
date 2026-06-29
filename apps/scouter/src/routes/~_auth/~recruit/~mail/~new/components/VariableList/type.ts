import type { VariableTypeName } from '@/apis/mails/schema';

export type LinkVariableValue = { text?: string; url?: string };

export type VariableValueType = Date | LinkVariableValue | string | undefined;

export const isLinkValue = (val: VariableValueType): val is LinkVariableValue =>
  val != null && typeof val === 'object' && !(val instanceof Date);

export const variableTabs = ['전체', '사람', '텍스트', '날짜', '링크'] as const;
export type VariableTab = (typeof variableTabs)[number];

export const tabTypeMap = {
  전체: null,
  사람: ['PERSON', 'APPLICANT'],
  텍스트: ['TEXT', 'PARTNAME'],
  날짜: ['DATE'],
  링크: ['LINK'],
} as const satisfies Record<VariableTab, null | VariableTypeName[]>;
