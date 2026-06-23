import { type QueryKey, useQueryClient } from '@tanstack/react-query';

export const useQueryInvalidation = (queryKey: QueryKey) => {
  const queryClient = useQueryClient();
  return {
    invalidate: () => queryClient.invalidateQueries({ queryKey }),
  };
};
