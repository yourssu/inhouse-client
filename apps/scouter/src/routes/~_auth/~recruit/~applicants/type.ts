import { pick } from 'es-toolkit';

import type { ApplicantStateType } from '@/apis/applicants/schema';

import { applicantStateKo } from '@/types/applicants';

export const applicantTabNameKo = {
  UNDER_REVIEW: '전형 진행 중',
  ...pick(applicantStateKo, [
    'DOCUMENT_REJECTED',
    'ASSIGNMENT_REJECTED',
    'INTERVIEW_REJECTED',
    'INCUBATING_REJECTED',
    'FINAL_ACCEPTED',
  ]),
} as const;

export type ApplicantTabNameType = keyof typeof applicantTabNameKo;

export const applicantStatesByTab = {
  UNDER_REVIEW: ['UNDER_REVIEW', 'DOCUMENT_ACCEPTED', 'ASSIGNMENT_ACCEPTED'],
  DOCUMENT_REJECTED: ['DOCUMENT_REJECTED'],
  ASSIGNMENT_REJECTED: ['ASSIGNMENT_REJECTED'],
  INTERVIEW_REJECTED: ['INTERVIEW_REJECTED'],
  INCUBATING_REJECTED: ['INCUBATING_REJECTED'],
  FINAL_ACCEPTED: ['FINAL_ACCEPTED'],
} as const satisfies Record<ApplicantTabNameType, readonly ApplicantStateType[]>;
