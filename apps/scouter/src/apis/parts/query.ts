import { queryOptions } from '@tanstack/react-query';

import { getParts } from '@/apis/parts';

export const partsOption = () => {
  const queryKey = ['parts'];

  return queryOptions({
    queryKey,
    queryFn: () => getParts(),
    staleTime: Infinity,
  });
};
