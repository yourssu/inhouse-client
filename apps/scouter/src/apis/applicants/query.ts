import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import {
  getApplicantById,
  getApplicantDocumentAnswers,
  getApplicantDocumentsEvaluations,
  getApplicants,
  getApplicantsLastUpdatedTime,
  type GetApplicantsParams,
} from '@/apis/applicants';

const qk = pluginQueryKey('scouter');

export const applicantsOption = (params?: GetApplicantsParams) =>
  queryOptions({
    queryKey: qk.for('applicants', params),
    queryFn: () => getApplicants(params),
  });

export const applicantByIdOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId),
    queryFn: () => getApplicantById(applicantId),
  });

export const applicantsLastUpdatedTimeOption = () =>
  queryOptions({
    queryKey: qk.for('applicants', 'lastUpdatedTime'),
    queryFn: () => getApplicantsLastUpdatedTime(),
  });

export const applicantDocumentAnswersOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId, 'answer'),
    queryFn: () => getApplicantDocumentAnswers(applicantId),
  });

export const getApplicantDocumentsEvaluationsOption = (applicantId: number) =>
  queryOptions({
    queryKey: qk.for('applicants', applicantId, 'documents', 'evaluations'),
    queryFn: () => getApplicantDocumentsEvaluations(applicantId),
  });
