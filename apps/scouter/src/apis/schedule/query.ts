import { queryOptions } from '@tanstack/react-query';
import { createQueryKeyNamespace } from '@yourssu-inhouse/inhouse-utils/query';

import { getInterviewSchedules, type GetSchedulesParams } from '@/apis/schedule';

const qk = createQueryKeyNamespace('scouter');

export const interviewSchedulesQueryKey = qk.for('interview', 'schedules');

export const interviewSchedulesOption = (params?: GetSchedulesParams) =>
  queryOptions({
    queryKey: qk.for('interview', 'schedules', params),
    queryFn: () => getInterviewSchedules(params),
  });
