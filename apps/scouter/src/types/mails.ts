import { objectValues } from '@yourssu-inhouse/inhouse-utils/object';

import type { MailReservationStatusType, VariableTypeName } from '@/apis/mails/schema';

export const mailStatusNameMap = {
  SCHEDULED: '예약됨',
  SENT: '발송 완료',
  PENDING_SEND: '발송 실패',
} as const satisfies Record<MailReservationStatusType, string>;

export const mailStatusNames = objectValues(mailStatusNameMap);
export type MailStatusNameType = (typeof mailStatusNames)[number];

export const variableTypeNameKo = {
  TEXT: '텍스트',
  PERSON: '사람',
  DATE: '날짜',
  LINK: '링크',
  APPLICANT: '사람/지원자',
  PARTNAME: '텍스트/파트명',
} as const satisfies Record<VariableTypeName, string>;
