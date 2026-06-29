import { queryOptions } from '@tanstack/react-query';

export const makeQueryOption = <TParams, TReturn>(
  queryKey: (params: TParams) => string[],
  queryFn: (params: TParams) => Promise<TReturn>,
) => {
  const getQueryKey = (params: TParams) => queryKey(params);

  const getQueryOption = (params: TParams) =>
    queryOptions({
      queryKey: getQueryKey(params),
      queryFn: () => queryFn(params),
    });

  return [getQueryKey, getQueryOption] as const;
};
