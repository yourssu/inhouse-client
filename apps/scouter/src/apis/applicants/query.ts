import { queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import {
  getApplicantById,
  getApplicantDocumentAnswers,
  getApplicants,
  getApplicantsLastUpdatedTime,
  type GetApplicantsParams,
} from '@/apis/applicants';

const qk = createQueryKeyNamespace('scouter');

export const applicantsQueryKeys = {
  all: () => qk.for('applicants'),
  list: (params?: GetApplicantsParams) => qk.for('applicants', 'list', params),
};

export const applicantsOption = (params?: GetApplicantsParams) =>
  queryOptions({
    queryKey: applicantsQueryKeys.list(params),
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
    staleTime: Infinity,
  });
