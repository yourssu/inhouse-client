import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getApplicantDocumentComments } from '@/apis/eval/comments';

const qk = pluginQueryKey('scouter');

export const commentsQueryKey = (applicantId: number) =>
  qk.for('applicants', applicantId, 'documents', 'comments');

export const applicantDocumentCommentsOption = (applicantId: number) =>
  queryOptions({
    queryKey: commentsQueryKey(applicantId),
    queryFn: () => getApplicantDocumentComments(applicantId),
  });
