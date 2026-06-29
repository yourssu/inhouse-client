import { queryOptions } from '@tanstack/react-query';

import { getSemesters, getSemestersNow } from '@/apis/semesters';

export const semestersOption = () => {
  const queryKey = ['semesters'];

  return queryOptions({
    queryKey,
    queryFn: () => getSemesters(),
    staleTime: Infinity,
  });
};

export const semestersNowOption = () => {
  const queryKey = ['semesters', 'now'];

  return queryOptions({
    queryKey,
    queryFn: () => getSemestersNow(),
    staleTime: 1000 * 60 * 60 * 24, // 24시간
  });
};
