import type {
  InterviewEvaluationResult,
  InterviewEvaluatorStatusValue,
} from '@/apis/interviews/evaluations/schema';
import type { InterviewRubricGroupName } from '@/apis/interviews/rubrics/schema';

export const interviewRubricFitTypeKo = {
  CULTURE_FIT: '컬쳐핏',
  TEAM_FIT: '팀핏',
  JOB_FIT: '잡핏',
} as const satisfies Record<InterviewRubricGroupName, string>;

export const interviewResultsKo = ['보류', '최종 합격', '면접 불합격'] as const;

export const interviewResultKo = {
  PENDING: '보류',
  FINAL_PASS: '최종 합격',
  INTERVIEW_FAIL: '면접 불합격',
} as const satisfies Record<InterviewEvaluationResult, string>;

export const interviewEvaluatorStatusOptions = {
  NOT_STARTED: { color: 'grey', label: '미작성' },
  IN_PROGRESS: { color: 'yellow', label: '미제출' },
  SUBMITTED: { color: 'green', label: '제출 완료' },
} satisfies Record<
  InterviewEvaluatorStatusValue,
  { color: 'green' | 'grey' | 'yellow'; label: string }
>;
