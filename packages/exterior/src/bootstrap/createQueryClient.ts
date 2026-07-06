import { QueryClient, type QueryClientConfig } from '@tanstack/react-query';

interface CreateQueryClientOptions {
  queryClientConfig?: QueryClientConfig;
}

const defaultQueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
} satisfies QueryClientConfig;

export const createQueryClient = ({ queryClientConfig }: CreateQueryClientOptions = {}) => {
  return new QueryClient({
    ...queryClientConfig,
    defaultOptions: {
      ...defaultQueryClientConfig.defaultOptions,
      ...queryClientConfig?.defaultOptions,
      queries: {
        ...defaultQueryClientConfig.defaultOptions.queries,
        ...queryClientConfig?.defaultOptions?.queries,
      },
    },
  });
};
