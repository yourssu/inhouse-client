import type { MemberRoleType, MemberStateType } from '@/apis/members/schema';

export const memberRoleKo = {
  ViceLead: '부리드',
  Member: '멤버',
  Lead: '리드',
} as const satisfies Record<MemberRoleType, string>;

export const memberStateEn = {
  액티브: 'active',
  비액티브: 'inactive',
  졸업: 'graduated',
  수료: 'completed',
  탈퇴: 'withdrawn',
} as const satisfies Record<MemberStateType, string>;
