import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getInterviewSchedules, type GetSchedulesParams } from '@/apis/schedule';

/*
  scouter 의 모든 query key 는 pluginQueryKey('scouter') 로 namespace 돼요. shell 이 하나의
  QueryClient 를 여러 plugin 이 공유하므로, plugin name prefix 가 없으면 다른 plugin 의 cache
  와 충돌할 수 있어요. 플랫폼이 namespace 규칙을 강제해요.
*/
const qk = pluginQueryKey('scouter');

export const interviewSchedulesOption = (params?: GetSchedulesParams) =>
  queryOptions({
    queryKey: qk.for('interview', 'schedules', params),
    queryFn: () => getInterviewSchedules(params),
  });
