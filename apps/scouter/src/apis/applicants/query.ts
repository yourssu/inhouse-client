import { queryOptions } from '@tanstack/react-query';

import {
  getApplicantById,
  getApplicants,
  getApplicantsLastUpdatedTime,
  type GetApplicantsParams,
} from '@/apis/applicants';

export const applicantsOption = (params?: GetApplicantsParams) => {
  const queryKey = ['applicants', params];

  return queryOptions({
    queryKey,
    queryFn: () => getApplicants(params),
  });
};

export const applicantByIdOption = (applicantId: number) => {
  const queryKey = ['applicants', applicantId];

  return queryOptions({
    queryKey,
    queryFn: () => getApplicantById(applicantId),
  });
};

export const applicantsLastUpdatedTimeOption = () => {
  const queryKey = ['applicants', 'lastUpdatedTime'];

  return queryOptions({
    queryKey,
    queryFn: () => getApplicantsLastUpdatedTime(),
  });
};
