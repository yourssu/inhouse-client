import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import {
  getApplicantDocumentComments,
  getApplicantDocumentEvaluatorStatuses,
  getApplicantDocumentsEvaluations,
  getApplicantDocumentsOthersEvaluations,
  getPartDocumentsDeadline,
  getPartDocumentsRubrics,
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

export const documentEvaluatorStatusesOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId, 'documents', 'evaluations', 'status'),
    queryFn: () => getApplicantDocumentEvaluatorStatuses(applicantId),
  });

export const commentsQueryKey = (applicantId: number) =>
  qk.for('applicants', applicantId, 'documents', 'comments');

export const applicantDocumentCommentsOption = (applicantId: number) =>
  queryOptions({
    queryKey: commentsQueryKey(applicantId),
    queryFn: () => getApplicantDocumentComments(applicantId),
  });

export const getPartDocumentsRubricsOption = (partId: number) =>
  queryOptions({
    queryKey: qk.for('parts', partId, 'documents', 'rubrics'),
    queryFn: () => getPartDocumentsRubrics(partId),
  });

export const getPartDocumentsDeadlineOption = (partId: number) =>
  queryOptions({
    queryKey: qk.for('parts', partId, 'documents', 'deadline'),
    queryFn: () => getPartDocumentsDeadline(partId),
  });
