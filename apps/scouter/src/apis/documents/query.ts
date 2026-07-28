import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import {
  getApplicantDocumentComments,
  getApplicantDocumentsEvaluations,
  getApplicantDocumentsOthersEvaluations,
} from '@/apis/documents';

const qk = pluginQueryKey('scouter');

export const getApplicantDocumentsEvaluationsOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId, 'documents', 'evaluations'),
    queryFn: () => getApplicantDocumentsEvaluations(applicantId),
  });

export const getApplicantDocumentsOthersEvaluationsOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId, 'documents', 'evaluations', 'others'),
    queryFn: () => getApplicantDocumentsOthersEvaluations(applicantId),
  });

export const commentsQueryKey = (applicantId: number) =>
  qk.for('applicants', applicantId, 'documents', 'comments');

export const applicantDocumentCommentsOption = (applicantId: number) =>
  queryOptions({
    queryKey: commentsQueryKey(applicantId),
    queryFn: () => getApplicantDocumentComments(applicantId),
  });
