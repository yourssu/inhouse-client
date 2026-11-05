import { createQueryKeyNamespace } from '@inhouse/utils/query';
import { queryOptions } from '@tanstack/react-query';

import type { InterviewRubricParams } from '@/apis/interviews/rubrics/schema';

import { getInterviewRubric } from '@/apis/interviews/rubrics';

const qk = createQueryKeyNamespace('scouter');

export const interviewRubricQueryKeys = {
  all: () => qk.for('interviews', 'rubrics'),
  part: (params: InterviewRubricParams) => qk.for('interviews', 'rubrics', 'part', params),
};

export const interviewRubricOption = (params: InterviewRubricParams) =>
  queryOptions({
    queryKey: interviewRubricQueryKeys.part(params),
    queryFn: () => getInterviewRubric(params),
  });
