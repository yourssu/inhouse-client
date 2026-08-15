import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import type { InterviewRubricParams } from '@/apis/interviews/rubrics/schema';

import { getInterviewRubric, updateInterviewRubric } from '@/apis/interviews/rubrics';

const qk = pluginQueryKey('scouter');

export const interviewRubricQueryKeys = {
  all: () => qk.for('interviews', 'rubrics'),
  part: (params: InterviewRubricParams) => qk.for('interviews', 'rubrics', 'part', params),
};

export const interviewRubricOption = (params: InterviewRubricParams) =>
  queryOptions({
    queryKey: interviewRubricQueryKeys.part(params),
    queryFn: () => getInterviewRubric(params),
  });

export const updateInterviewRubricMutationOptions = mutationOptions({
  mutationFn: updateInterviewRubric,
  onSuccess: (_, { partId, semester }, _onMutateResult, context) =>
    // 변경한 파트 루브릭 쿼리 무효화
    context.client.invalidateQueries({
      queryKey: interviewRubricQueryKeys.part({ partId, semester }),
    }),
});
