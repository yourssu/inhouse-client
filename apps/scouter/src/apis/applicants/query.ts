import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import {
  getApplicantById,
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
