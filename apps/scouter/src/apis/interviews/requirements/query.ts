import { mutationOptions, type QueryClient, queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import type {
  GlobalInterviewRequirementsParams,
  InterviewRequirementsParams,
} from '@/apis/interviews/requirements/schema';

import {
  getGlobalInterviewRequirements,
  getInterviewRequirements,
  updateGlobalInterviewRequirements,
  updateInterviewRequirements,
} from '@/apis/interviews/requirements';

const qk = pluginQueryKey('scouter');

export const interviewRequirementsQueryKeys = {
  all: () => qk.for('interviews', 'requirements'),
  global: (params: GlobalInterviewRequirementsParams) =>
    qk.for('interviews', 'requirements', 'global', params),
  part: (params: InterviewRequirementsParams) =>
    qk.for('interviews', 'requirements', 'part', params),
};

export const interviewRequirementsOption = (params: InterviewRequirementsParams) =>
  queryOptions({
    queryKey: interviewRequirementsQueryKeys.part(params),
    queryFn: () => getInterviewRequirements(params),
  });

export const updateInterviewRequirementsMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: updateInterviewRequirements,
    onSuccess: (_, { partId, semester }) =>
      queryClient.invalidateQueries({
        queryKey: interviewRequirementsQueryKeys.part({ partId, semester }),
      }),
  });

export const globalInterviewRequirementsOption = (params: GlobalInterviewRequirementsParams) =>
  queryOptions({
    queryKey: interviewRequirementsQueryKeys.global(params),
    queryFn: () => getGlobalInterviewRequirements(params),
  });

export const updateGlobalInterviewRequirementsMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: updateGlobalInterviewRequirements,
    onSuccess: (_, { semester }) =>
      queryClient.invalidateQueries({
        queryKey: interviewRequirementsQueryKeys.global({ semester }),
      }),
  });
