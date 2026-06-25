import { createQueryClient } from '@yourssu-inhouse/exterior';

export const queryClient = createQueryClient({
  queryClientConfig: {
    defaultOptions: {
      queries: {
        throwOnError: true,
      },
    },
  },
});
