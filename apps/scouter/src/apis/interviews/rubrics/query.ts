import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import type { InterviewRubricParams } from '@/apis/interviews/rubrics/schema';

import { getInterviewRubric } from '@/apis/interviews/rubrics';

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
