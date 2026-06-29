import { z } from 'zod/v4';

import type { Merge } from '@/types/misc';

import { DivisionNameSchema } from '@/apis/divisions/schema';
import { PartNameSchema } from '@/apis/parts/schema';

export const memberRole = ['Lead', 'ViceLead', 'Member'] as const;

export const memberState = ['액티브', '비액티브', '졸업', '수료', '탈퇴'] as const;

export const PeriodSchema = z.object({
  startSemester: z.string(), // 시작 학기
  endSemester: z.string(),
});

export const MemberStateSchema = z.enum(memberState);

export const MemberRoleSchema = z.enum(memberRole);

export const BaseMemberSchema = z.object({
  memberId: z.number(), // ID
  parts: z.array(z.object({ division: DivisionNameSchema, part: PartNameSchema })),
  role: MemberRoleSchema, // 역할
  name: z.string(), // 이름
  nickname: z.string(), // 닉네임
  email: z.email(), // 이메일
  phoneNumber: z.string().nullable(), // 전화번호 (민감 필드)
  department: z.string(), // 학과
  studentId: z.string().nullable(), // 학번 (민감 필드)
  birthDate: z.iso.date().nullable(), // 생년월일 (민감 필드)
  joinDate: z.iso.date(), // 입부일
  note: z.string().nullable(), // 비고 (민감 필드)
  state: MemberStateSchema, // 활동 상태
});

export const MeSchema = BaseMemberSchema.omit({
  note: true,
}).extend({
  profileImageUrl: z.url(),
  stateUpdatedTime: z.iso.datetime(),
  // createdTime: z.iso.datetime(),
  // updatedTime: z.iso.datetime(),
});

export const ActiveMemberSchema = BaseMemberSchema.extend({
  membershipFee: z.boolean().nullable(), // 회비 납부 여부 (민감 필드)
  state: z.literal('액티브'),
  grade: z.number().nullable(),
  isOnLeave: z.boolean().nullable(),
});

export const InactiveMemberSchema = BaseMemberSchema.extend({
  activePeriod: PeriodSchema, // 활동 기간
  expectedReturnSemester: z.string().nullable(), // 복귀 예정 학기 (민감 필드)
  // inactivePeriod: PeriodSchema, // 휴면 기간
  state: z.literal('비액티브'),
});

export const GraduatedMemberSchema = BaseMemberSchema.extend({
  activePeriod: PeriodSchema.nullable(), // 활동 기간 (민감 필드)
  isAdvisorDesired: z.boolean(), // 고문 희망 여부
  state: z.literal('졸업'),
});

export const CompletedMemberSchema = BaseMemberSchema.extend({
  activePeriod: PeriodSchema.nullable(), // 활동 기간 (민감 필드)
  isAdvisorDesired: z.boolean(), // 고문 희망 여부
  state: z.literal('수료'),
});

export const WithdrawnMemberSchema = BaseMemberSchema.extend({
  withdrawnDate: z.iso.date().nullable(), // 탈퇴일자 (민감 필드)
  state: z.literal('탈퇴'),
});

export const LastMemberSyncTimeSchema = z.object({
  lastUpdatedTime: z.iso.datetime().optional(), // 마지막 새로고침 시간
});

export const MemberIncludeFromApplicantsResponseSchema = z.object({
  failureMessages: z.array(z.string()),
  createdCount: z.number(),
});

export const MemberListResponseSchema = <T extends z.ZodType>(memberSchema: T) =>
  z.object({
    isSensitiveMasked: z.boolean(),
    members: z.array(memberSchema),
  });

export type MemberPeriodType = z.infer<typeof PeriodSchema>;
export type MemberStateType = z.infer<typeof MemberStateSchema>;
export type MemberRoleType = z.infer<typeof MemberRoleSchema>;
export type BaseMemberType = z.infer<typeof BaseMemberSchema>;
export type MeType = z.infer<typeof MeSchema>;
export type ActiveMemberType = z.infer<typeof ActiveMemberSchema>;
export type InactiveMemberType = z.infer<typeof InactiveMemberSchema>;
export type GraduatedMemberType = z.infer<typeof GraduatedMemberSchema>;
export type CompletedMemberType = z.infer<typeof CompletedMemberSchema>;
export type WithdrawnMemberType = z.infer<typeof WithdrawnMemberSchema>;
export type MemberListResponseType<T> = {
  isSensitiveMasked: boolean;
  members: T[];
};
export type AmbiguousMemberType = Partial<
  Merge<
    Merge<
      Merge<
        Merge<Merge<ActiveMemberType, GraduatedMemberType>, CompletedMemberType>,
        InactiveMemberType
      >,
      WithdrawnMemberType
    >,
    { state: MemberStateType }
  >
>;
