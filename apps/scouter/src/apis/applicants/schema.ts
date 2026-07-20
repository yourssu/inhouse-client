import z from 'zod/v4';

import { DivisionNameSchema } from '@/apis/divisions/schema';
import { PartNameSchema } from '@/apis/parts/schema';

export const applicantStates = [
  'UNDER_REVIEW',
  'DOCUMENT_ACCEPTED',
  'DOCUMENT_REJECTED',
  'INTERVIEW_ACCEPTED',
  'INTERVIEW_REJECTED',
  'INCUBATING_REJECTED',
  'FINAL_ACCEPTED',
] as const;

export const ApplicantStateSchema = z.enum(applicantStates);

export const ApplicantSchema = z.object({
  applicantId: z.number(),
  division: DivisionNameSchema, // 구분
  part: PartNameSchema, // 파트
  name: z.string(), // 이름
  state: ApplicantStateSchema, // 상태
  applicationDate: z.iso.date(), // 지원 날짜
  email: z.email(), // 이메일
  phoneNumber: z.string(), // 전화번호
  department: z.string(), // 학과
  studentId: z.string(), // 학번
  semester: z.string(), // 학기
  age: z.string(), // 나이
  availableTimes: z.array(z.iso.datetime()), // 면접 가능 시간
});

export const LastApplicantSyncTimeSchema = z.object({
  lastUpdatedTime: z.iso.datetime().optional(),
});

export const CreateApplicantRequestSchema = z.object({
  partId: z.number(),
  name: z.string(),
  state: ApplicantStateSchema,
  applicationDate: z.iso.date(),
  email: z.email(),
  phoneNumber: z.string(),
  departmentId: z.number(),
  studentId: z.string(),
  semesterId: z.number(),
  age: z.string(),
  academicSemester: z.string(),
  availableTimes: z.array(z.iso.datetime()),
});

export const ApplicantSyncResponseSchema = z.object({
  successes: z.array(z.string()),
  failures: z.array(z.string()),
});

export const ApplicantDocumentAnswerSectionSchema = z.object({
  sectionId: z.number(),
  question: z.string(),
  answer: z.string(),
});

export const ApplicantDocumentAnswersSchema = z.object({
  applicantId: z.number(),
  name: z.string(),
  part: PartNameSchema,
  submittedAt: z.iso.datetime(),
  sections: z.array(ApplicantDocumentAnswerSectionSchema),
});

export const UpdateApplicantRequestSchema = CreateApplicantRequestSchema.partial();

export type ApplicantType = z.infer<typeof ApplicantSchema>;
export type ApplicantStateType = z.infer<typeof ApplicantStateSchema>;
export type LastApplicantSyncTimeType = z.infer<typeof LastApplicantSyncTimeSchema>;
export type CreateApplicantRequestType = z.infer<typeof CreateApplicantRequestSchema>;
export type UpdateApplicantRequestType = z.infer<typeof UpdateApplicantRequestSchema>;
export type ApplicantSyncResponseType = z.infer<typeof ApplicantSyncResponseSchema>;
export type ApplicantAnswerSectionType = z.infer<typeof ApplicantDocumentAnswerSectionSchema>;
export type ApplicantDocumentAnswersType = z.infer<typeof ApplicantDocumentAnswersSchema>;
