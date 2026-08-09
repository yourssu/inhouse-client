import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import type {
  GlobalInterviewRequirementsParams,
  InterviewRequirementsParams,
} from '@/apis/interviews/requirements/schema';

import {
  getInterviewRequirements,
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

export const updateInterviewRequirementsMutationOptions = mutationOptions({
  mutationFn: updateInterviewRequirements,
  onSuccess: (_, { partId, semester }, _onMutateResult, context) =>
    // 변경한 파트 요구조건 쿼리 무효화
    context.client.invalidateQueries({
      queryKey: interviewRequirementsQueryKeys.part({ partId, semester }),
    }),
});
