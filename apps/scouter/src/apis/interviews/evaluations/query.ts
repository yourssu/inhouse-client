import { queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import {
  getInterviewEvaluatorStatuses,
  getMyInterviewEvaluation,
  getOtherInterviewEvaluations,
} from '@/apis/interviews/evaluations';

const qk = createQueryKeyNamespace('scouter');

export const interviewEvaluationsQueryKeys = {
  all: () => qk.for('interviews', 'evaluations'),
  applicant: (applicantId: number) => qk.for('interviews', 'evaluations', 'applicant', applicantId),
  my: (applicantId: number) => qk.for('interviews', 'evaluations', 'applicant', applicantId, 'my'),
  statuses: (applicantId: number) =>
    qk.for('interviews', 'evaluations', 'applicant', applicantId, 'status'),
  others: (applicantId: number) =>
    qk.for('interviews', 'evaluations', 'applicant', applicantId, 'others'),
};

export const myInterviewEvaluationOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewEvaluationsQueryKeys.my(applicantId),
    queryFn: () => getMyInterviewEvaluation(applicantId),
  });

export const interviewEvaluatorStatusesOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewEvaluationsQueryKeys.statuses(applicantId),
    queryFn: () => getInterviewEvaluatorStatuses(applicantId),
  });

export const otherInterviewEvaluationsOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewEvaluationsQueryKeys.others(applicantId),
    queryFn: () => getOtherInterviewEvaluations(applicantId),
  });
