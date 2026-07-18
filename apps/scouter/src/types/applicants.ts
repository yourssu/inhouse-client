import type { ApplicantStateType } from '@/apis/applicants/schema';

export const applicantStateKo = {
  UNDER_REVIEW: '심사 진행 중',
  DOCUMENT_ACCEPTED: '서류 합격',
  DOCUMENT_REJECTED: '서류 불합',
  INTERVIEW_ACCEPTED: '면접 합격',
  INTERVIEW_REJECTED: '면접 불합',
  INCUBATING_REJECTED: '인큐베이팅 불합',
  FINAL_ACCEPTED: '최종 합격',
} as const satisfies Record<ApplicantStateType, string>;
