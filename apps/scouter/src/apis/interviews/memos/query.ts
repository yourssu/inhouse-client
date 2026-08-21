import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getApplicantInterviewMemos } from '@/apis/interviews/memos';

const qk = pluginQueryKey('scouter');

export const interviewMemosQueryKey = (applicantId: number) =>
  qk.for('applicants', applicantId, 'interviews', 'memos');

export const interviewMemosOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewMemosQueryKey(applicantId),
    queryFn: () => getApplicantInterviewMemos(applicantId),
  });
