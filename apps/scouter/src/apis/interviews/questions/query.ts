import { mutationOptions, type QueryClient, queryOptions } from '@tanstack/react-query';
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

export const saveAssignedQuestionsMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: saveAssignedQuestions,
    onSuccess: (questions, { applicantId }) => {
      queryClient.setQueryData(interviewQuestionsQueryKeys.applicant(applicantId), questions);
    },
  });
