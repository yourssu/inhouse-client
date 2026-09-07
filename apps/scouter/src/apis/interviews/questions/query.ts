import { queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import type { PartInterviewQuestionsParams } from '@/apis/interviews/questions/schema';

import { getAssignedQuestions, getPartInterviewQuestions } from '@/apis/interviews/questions';

const qk = createQueryKeyNamespace('scouter');

export const interviewQuestionsQueryKeys = {
  all: () => qk.for('interviews', 'questions'),
  applicant: (applicantId: number) => qk.for('interviews', 'questions', 'applicant', applicantId),
  part: (params: PartInterviewQuestionsParams) => qk.for('interviews', 'questions', 'part', params),
};

export const assignedQuestionsOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewQuestionsQueryKeys.applicant(applicantId),
    queryFn: () => getAssignedQuestions(applicantId),
  });

export const partInterviewQuestionsOption = (params: PartInterviewQuestionsParams) =>
  queryOptions({
    queryKey: interviewQuestionsQueryKeys.part(params),
    queryFn: () => getPartInterviewQuestions(params),
  });
