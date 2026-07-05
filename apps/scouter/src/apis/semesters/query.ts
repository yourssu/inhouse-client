import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getSemesters, getSemestersNow } from '@/apis/semesters';

const qk = pluginQueryKey('scouter');

export const semestersOption = () =>
  queryOptions({
    queryKey: qk.for('semesters'),
    queryFn: () => getSemesters(),
    staleTime: Infinity,
  });

export const semestersNowOption = () =>
  queryOptions({
    queryKey: qk.for('semesters', 'now'),
    queryFn: () => getSemestersNow(),
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });
