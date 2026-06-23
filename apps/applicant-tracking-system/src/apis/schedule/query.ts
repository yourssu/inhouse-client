import { queryOptions } from '@tanstack/react-query';

import { getInterviewSchedules, type GetSchedulesParams } from '@/apis/schedule';

export const interviewSchedulesOption = (params?: GetSchedulesParams) => {
  const queryKey = ['interview', 'schedules', params];

  return queryOptions({
    queryKey,
    queryFn: () => getInterviewSchedules(params),
  });
};
