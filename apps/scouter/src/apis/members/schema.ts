import { z } from 'zod/v4';

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

const MemberIdentitySchema = z.object({
  memberId: z.number(), // ID
  parts: z.array(z.object({ division: DivisionNameSchema, part: PartNameSchema })),
  role: z.string(), // 역할
  name: z.string(), // 이름
  nickname: z.string(), // 닉네임
  state: z.string(), // 활동 상태
});

export const BaseMemberSchema = MemberIdentitySchema.extend({
  email: z.email(), // 이메일
  phoneNumber: z.string().nullish(), // 전화번호 (민감 필드)
  department: z.string(), // 학과
  studentId: z.string().nullish(), // 학번 (민감 필드)
  birthDate: z.iso.date().nullish(), // 생년월일 (민감 필드)
  joinDate: z.iso.date(), // 입부일
  note: z.string().nullish(), // 비고 (민감 필드)
});

export const MeSchema = MemberIdentitySchema.extend({
  profileImageUrl: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  birthDate: z.iso.date(),
  department: z.string(),
  studentId: z.string(),
  joinDate: z.iso.date(),
  stateUpdatedTime: z.iso.datetime(),
  createdTime: z.iso.datetime(),
  updatedTime: z.iso.datetime(),
  userId: z.number(),
});

export const ActiveMemberSchema = BaseMemberSchema.extend({
  membershipFee: z.boolean().nullish(), // 회비 납부 여부 (민감 필드)
  grade: z.number().nullish(),
  isOnLeave: z.boolean().nullish(),
  userId: z.number().nullish(), // 로그인 계정 ID (계정이 연동되지 않은 멤버는 null)
});

export const InactiveMemberSchema = BaseMemberSchema.extend({
  activePeriod: PeriodSchema.nullable(), // 활동 기간
  expectedReturnSemester: z.string().nullish(), // 복귀 예정 학기 (민감 필드)
  inactivePeriod: PeriodSchema.nullable(), // 비액티브 기간
  reason: z.string().nullish(),
  smsReplied: z.boolean().nullish(),
  smsReplyDesiredPeriod: z.string().nullish(),
  activitySemestersLabel: z.string().nullish(),
  totalActiveSemesters: z.number().nullish(),
  totalInactiveSemesters: z.number().nullish(),
  activeSemesterCountLabel: z.string().nullish(),
  inactiveSemesterCountLabel: z.string().nullish(),
});

export const GraduatedMemberSchema = BaseMemberSchema.extend({
  activePeriod: PeriodSchema.nullish(), // 활동 기간 (민감 필드)
  isAdvisorDesired: z.boolean(), // 고문 희망 여부
});

export const CompletedMemberSchema = BaseMemberSchema.extend({
  completionSemester: z.string().nullish(),
});

export const WithdrawnMemberSchema = MemberIdentitySchema.extend({
  withdrawnDate: z.iso.date().nullish(), // 탈퇴일자 (민감 필드)
  note: z.string().nullish(),
});

const UpdateMemberCommonRequestSchema = z.object({
  partIds: z.array(z.number()).optional(),
  role: z.string().optional(),
  name: z.string().optional(),
  nickname: z.string().optional(),
  state: z.string().optional(),
  email: z.string().optional(),
  phoneNumber: z.string().optional(),
  departmentId: z.number().optional(),
  studentId: z.string().optional(),
  birthDate: z.iso.date().optional(),
  joinDate: z.iso.date().optional(),
  note: z.string().optional(),
});

export const UpdateActiveMemberRequestSchema = UpdateMemberCommonRequestSchema.extend({
  membershipFee: z.boolean().optional(),
  grade: z.number().optional(),
  isOnLeave: z.boolean().optional(),
});

export const UpdateInactiveMemberRequestSchema = UpdateMemberCommonRequestSchema.extend({
  expectedReturnSemester: z.string().optional(),
  reason: z.string().optional(),
  smsReplied: z.boolean().optional(),
  smsReplyDesiredPeriod: z.string().optional(),
  activitySemestersLabel: z.string().optional(),
  totalActiveSemesters: z.number().optional(),
  totalInactiveSemesters: z.number().optional(),
  activitySemestersPatch: z
    .object({
      activitySemestersLabel: z.string().optional(),
      totalActiveSemesters: z.number().optional(),
    })
    .optional(),
});

export const UpdateGraduatedMemberRequestSchema = UpdateMemberCommonRequestSchema.extend({
  isAdvisorDesired: z.boolean().optional(),
});

export const UpdateCompletedMemberRequestSchema = UpdateMemberCommonRequestSchema.extend({
  completionSemester: z.string().optional(),
});

export const UpdateWithdrawnMemberRequestSchema = UpdateMemberCommonRequestSchema.extend({
  withdrawnDate: z.iso.date().optional(),
});

export const LastMemberSyncTimeSchema = z.object({
  lastUpdatedTime: z.iso.datetime().nullish(),
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
export type UpdateActiveMemberRequest = z.infer<typeof UpdateActiveMemberRequestSchema>;
export type UpdateInactiveMemberRequest = z.infer<typeof UpdateInactiveMemberRequestSchema>;
export type UpdateGraduatedMemberRequest = z.infer<typeof UpdateGraduatedMemberRequestSchema>;
export type UpdateCompletedMemberRequest = z.infer<typeof UpdateCompletedMemberRequestSchema>;
export type UpdateWithdrawnMemberRequest = z.infer<typeof UpdateWithdrawnMemberRequestSchema>;
