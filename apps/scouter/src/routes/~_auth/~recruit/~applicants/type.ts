import { pick } from 'es-toolkit';

import type { ApplicantStateType } from '@/apis/applicants/schema';

import { applicantStateKo } from '@/types/applicants';

export const applicantTabNameKo = pick(applicantStateKo, [
  'UNDER_REVIEW',
  'DOCUMENT_REJECTED',
  'ASSIGNMENT_REJECTED',
  'INTERVIEW_REJECTED',
  'INCUBATING_REJECTED',
  'FINAL_ACCEPTED',
]);

export type ApplicantTabNameType = keyof typeof applicantTabNameKo;

export const applicantStatesByTab = {
  UNDER_REVIEW: ['UNDER_REVIEW', 'DOCUMENT_ACCEPTED', 'ASSIGNMENT_ACCEPTED'],
  DOCUMENT_REJECTED: ['DOCUMENT_REJECTED'],
  ASSIGNMENT_REJECTED: ['ASSIGNMENT_REJECTED'],
  INTERVIEW_REJECTED: ['INTERVIEW_REJECTED'],
  INCUBATING_REJECTED: ['INCUBATING_REJECTED'],
  FINAL_ACCEPTED: ['FINAL_ACCEPTED'],
} as const satisfies Record<ApplicantTabNameType, readonly ApplicantStateType[]>;

export const getApplicantReviewStatus = (state: ApplicantStateType, hasAssignment: boolean) => {
  if (state === 'UNDER_REVIEW') {
    return '서류 평가 진행 중';
  }
  if (state === 'DOCUMENT_ACCEPTED') {
    return hasAssignment ? '과제 평가 진행 중' : '면접 평가 진행 중';
  }
  if (state === 'ASSIGNMENT_ACCEPTED') {
    return '면접 평가 진행 중';
  }
  return applicantStateKo[state];
};
