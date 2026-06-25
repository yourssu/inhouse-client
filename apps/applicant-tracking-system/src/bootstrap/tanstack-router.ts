import { createAppRouter } from '@yourssu-inhouse/exterior';

import { queryClient } from '@/bootstrap/queryClient';
import { routeTree } from '@/routeTree.gen';

export const router = createAppRouter({ routeTree, queryClient });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
