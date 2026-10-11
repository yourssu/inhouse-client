import { queryClient } from '@inhouse/query-client';
import { type QueryKey } from '@tanstack/react-query';

export const useQueryInvalidation = (queryKey: QueryKey) => {
  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  };
};
