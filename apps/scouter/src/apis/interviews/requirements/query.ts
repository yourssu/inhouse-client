import { createQueryKeyNamespace } from '@inhouse/utils/query';
import { queryOptions } from '@tanstack/react-query';

import type {
  GlobalInterviewRequirementsParams,
  InterviewRequirementsParams,
} from '@/apis/interviews/requirements/schema';

import { getInterviewRequirements } from '@/apis/interviews/requirements';

const qk = createQueryKeyNamespace('scouter');

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
