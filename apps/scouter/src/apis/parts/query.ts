import { queryOptions } from '@tanstack/react-query';
import { pluginQueryKey } from '@yourssu-inhouse/mfa-core';

import { getParts } from '@/apis/parts';

const qk = pluginQueryKey('scouter');

export const partsOption = () =>
  queryOptions({
    queryKey: qk.for('parts'),
    queryFn: () => getParts(),
    staleTime: Infinity,
  });
