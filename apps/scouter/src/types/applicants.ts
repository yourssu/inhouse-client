import type { ApplicantStateType } from '@/apis/applicants/schema';

export const applicantStateKo = {
  UNDER_REVIEW: '심사 진행 중',
  DOCUMENT_ACCEPTED: '서류 합격',
  DOCUMENT_REJECTED: '서류 불합',
  ASSIGNMENT_ACCEPTED: '과제 합격',
  ASSIGNMENT_REJECTED: '과제 불합',
  INTERVIEW_REJECTED: '면접 불합',
  INCUBATING_REJECTED: '인큐베이팅 불합',
  FINAL_ACCEPTED: '최종 합격',
} as const satisfies Record<ApplicantStateType, string>;

// 서류 평가 폼의 점수 입력, 코멘트, 제출, 최종 평가, 배점 설정 액션을 허용하는 지원자 상태예요.
const documentEvalActionAllowedStates: readonly ApplicantStateType[] = [
  'UNDER_REVIEW',
  'DOCUMENT_ACCEPTED',
  'DOCUMENT_REJECTED',
];

// 과제 평가 진입을 허용하는 지원자 상태에요.
const assignmentEvalActionAllowedStates: readonly ApplicantStateType[] = [
  'ASSIGNMENT_ACCEPTED',
  'ASSIGNMENT_REJECTED',
  'DOCUMENT_ACCEPTED',
];

// 질문지 설계 페이지 진입을 허용하는 지원자 상태예요.
const questionnaireActionAllowedStates: readonly ApplicantStateType[] = [
  'UNDER_REVIEW',
  'DOCUMENT_ACCEPTED',
  'ASSIGNMENT_ACCEPTED',
  'INTERVIEW_REJECTED',
  'INCUBATING_REJECTED',
  'FINAL_ACCEPTED',
];

// 면접 평가 페이지 진입을 허용하는 지원자 상태예요.
const interviewEvalActionAllowedStates: readonly ApplicantStateType[] = [
  'UNDER_REVIEW',
  'DOCUMENT_ACCEPTED',
  'ASSIGNMENT_ACCEPTED',
  'INTERVIEW_REJECTED',
  'INCUBATING_REJECTED',
  'FINAL_ACCEPTED',
];

export const isDocumentEvalActionAllowed = (state: ApplicantStateType): boolean =>
  documentEvalActionAllowedStates.includes(state);

export const isAssignmentEvalActionAllowed = (state: ApplicantStateType): boolean =>
  assignmentEvalActionAllowedStates.includes(state);

export const isQuestionnaireActionAllowed = (state: ApplicantStateType): boolean =>
  questionnaireActionAllowedStates.includes(state);

export const isInterviewEvalActionAllowed = (state: ApplicantStateType): boolean =>
  interviewEvalActionAllowedStates.includes(state);
