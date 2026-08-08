import z from 'zod/v4';

import { DivisionNameSchema } from '@/apis/divisions/schema';
import { PartNameSchema } from '@/apis/parts/schema';

export const applicantStates = [
  'UNDER_REVIEW',
  'DOCUMENT_ACCEPTED',
  'DOCUMENT_REJECTED',
  'ASSIGNMENT_ACCEPTED',
  'ASSIGNMENT_REJECTED',
  'INTERVIEW_ACCEPTED',
  'INTERVIEW_REJECTED',
  'INCUBATING_REJECTED',
  'FINAL_ACCEPTED',
] as const;

export const ApplicantStateSchema = z.enum(applicantStates);

export const ApplicantSchema = z.object({
  applicantId: z.number(),
  partId: z.number(),
  division: DivisionNameSchema, // 구분
  part: PartNameSchema, // 파트
  name: z.string(), // 이름
  state: ApplicantStateSchema, // 상태
  applicationDate: z.iso.date(), // 지원 날짜
  email: z.email(), // 이메일
  phoneNumber: z.string(), // 전화번호
  department: z.string(), // 학과
  studentId: z.string(), // 학번
  academicSemester: z.string(), // 재학 학기
  age: z.string(), // 나이
  availableTimes: z.array(z.iso.datetime()), // 면접 가능 시간
  documentAverageScore: z.number().nullish(), // 서류 평균 점수
  interviewAverageScore: z.number().nullish(), // 면접 평균 점수
});

export const LastApplicantSyncTimeSchema = z.object({
  lastUpdatedTime: z.iso.datetime().optional(),
});

export const ApplicantDocumentAnswerSectionSchema = z.object({
  sectionId: z.number().optional(),
  question: z.string(),
  answer: z.string(),
});

export const ApplicantDocumentAnswersSchema = z.array(ApplicantDocumentAnswerSectionSchema);

export const CreateApplicantRequestSchema = z.object({
  partId: z.number(),
  name: z.string().min(1),
  state: ApplicantStateSchema,
  applicationDate: z.iso.date(),
  email: z.email(),
  phoneNumber: z.string().regex(/^010-\d{4}-\d{4}$/),
  departmentId: z.number(),
  studentId: z.string().min(1),
  semesterId: z.number(),
  age: z.string().min(1),
  academicSemester: z.string().regex(/^\d-\d$/),
  availableTimes: z.array(z.iso.datetime()),
});

export const ApplicantSyncResponseSchema = z.object({
  successes: z.array(z.string()),
  failures: z.array(z.string()),
});

export const UpdateApplicantRequestSchema = CreateApplicantRequestSchema.partial();

export type ApplicantType = z.infer<typeof ApplicantSchema>;
export type ApplicantStateType = z.infer<typeof ApplicantStateSchema>;
export type LastApplicantSyncTimeType = z.infer<typeof LastApplicantSyncTimeSchema>;
export type ApplicantAnswerSectionType = z.infer<typeof ApplicantDocumentAnswerSectionSchema>;
export type ApplicantDocumentAnswersType = z.infer<typeof ApplicantDocumentAnswersSchema>;
export type CreateApplicantRequestType = z.infer<typeof CreateApplicantRequestSchema>;
export type UpdateApplicantRequestType = z.infer<typeof UpdateApplicantRequestSchema>;
export type ApplicantSyncResponseType = z.infer<typeof ApplicantSyncResponseSchema>;
