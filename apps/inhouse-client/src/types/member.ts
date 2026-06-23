import type { MemberPosition, MemberState, PartName } from '@/apis/members/schema';

export const memberStateKo = {
  active: '액티브',
  inactive: '비액티브',
  completed: '수료',
  withdrawn: '탈퇴',
} as const satisfies Record<MemberState, string>;

export const partNameKo = {
  'Head Lead': '헤드 리드',
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
} as const satisfies Record<PartName, string>;

export const memberPositionKo = {
  LEAD: '리드',
  VICELEAD: '부리드',
  MEMBER: '멤버',
} as const satisfies Record<MemberPosition, string>;
