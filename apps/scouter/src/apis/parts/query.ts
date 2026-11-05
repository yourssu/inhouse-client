import { createQueryKeyNamespace } from '@inhouse/utils/query';
import { queryOptions } from '@tanstack/react-query';

import { getParts } from '@/apis/parts';

const qk = createQueryKeyNamespace('scouter');

export const partsOption = () =>
  queryOptions({
    queryKey: qk.for('parts'),
    queryFn: () => getParts(),
    staleTime: Infinity,
  });
