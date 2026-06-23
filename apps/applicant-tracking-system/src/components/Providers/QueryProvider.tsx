import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      throwOnError: true,
    },
  },
});

export const QueryProvider = ({ children }: React.PropsWithChildren<unknown>) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
