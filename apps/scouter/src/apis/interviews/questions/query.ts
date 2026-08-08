import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import {
  getAssignedQuestions,
  getPartInterviewQuestions,
  saveAssignedQuestions,
} from '@/apis/interviews/questions';

const qk = pluginQueryKey('scouter');

export const interviewQuestionsQueryKeys = {
  all: () => qk.for('interviews', 'questions'),
  applicant: (applicantId: number) => qk.for('interviews', 'questions', 'applicant', applicantId),
  part: (partId: number) => qk.for('interviews', 'questions', 'part', partId),
};

export const assignedQuestionsOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewQuestionsQueryKeys.applicant(applicantId),
    queryFn: () => getAssignedQuestions(applicantId),
  });

export const partInterviewQuestionsOption = (partId: number) =>
  queryOptions({
    queryKey: interviewQuestionsQueryKeys.part(partId),
    queryFn: () => getPartInterviewQuestions(partId),
  });

export const saveAssignedQuestionsMutationOptions = mutationOptions({
  mutationFn: saveAssignedQuestions,
  // 지원자의 질문지 조회 쿼리를 무효화
  onSuccess: (_, { applicantId }, _onMutateResult, context) =>
    context.client.invalidateQueries({
      queryKey: interviewQuestionsQueryKeys.applicant(applicantId),
    }),
});
