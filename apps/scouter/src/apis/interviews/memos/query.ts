import { queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import { getApplicantInterviewMemos } from '@/apis/interviews/memos';

const qk = createQueryKeyNamespace('scouter');

export const interviewMemosQueryKey = (applicantId: number) =>
  qk.for('applicants', applicantId, 'interviews', 'memos');

export const interviewMemosOption = (applicantId: number) =>
  queryOptions({
    queryKey: interviewMemosQueryKey(applicantId),
    queryFn: () => getApplicantInterviewMemos(applicantId),
  });
