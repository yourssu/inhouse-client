import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import type { PartInterviewQuestionsParams } from '@/apis/interviews/questions/schema';

import {
  getAssignedQuestions,
  getPartInterviewQuestions,
  saveAssignedQuestions,
} from '@/apis/interviews/questions';

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

export const saveAssignedQuestionsMutationOptions = mutationOptions({
  mutationFn: saveAssignedQuestions,
  // 지원자의 질문지 조회 쿼리를 무효화
  onSuccess: (_, { applicantId }, _onMutateResult, context) =>
    context.client.invalidateQueries({
      queryKey: interviewQuestionsQueryKeys.applicant(applicantId),
    }),
});
