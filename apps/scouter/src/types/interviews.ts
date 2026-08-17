import type { InterviewEvaluationResult } from '@/apis/interviews/evaluations/schema';
import type { InterviewRubricGroupName } from '@/apis/interviews/rubrics/schema';

export const interviewRubricGroupKo = {
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
