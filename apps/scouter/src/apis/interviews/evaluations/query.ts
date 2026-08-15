import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getInterviewEvaluatorStatuses } from '@/apis/interviews/evaluations';

const qk = pluginQueryKey('scouter');

export const interviewEvaluatorStatusesOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId, 'interviews', 'evaluations', 'status'),
    queryFn: () => getInterviewEvaluatorStatuses(applicantId),
  });
