import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getInterviewSchedules, type GetSchedulesParams } from '@/apis/schedule';

const qk = pluginQueryKey('scouter');

export const interviewSchedulesQueryKey = qk.for('interview', 'schedules');

export const interviewSchedulesOption = (params?: GetSchedulesParams) =>
  queryOptions({
    queryKey: qk.for('interview', 'schedules', params),
    queryFn: () => getInterviewSchedules(params),
  });
