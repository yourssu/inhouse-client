import { createRouter } from '@tanstack/react-router';

import { queryClient } from '@/bootstrap/tanstack-query';
import { routeTree } from '@/routeTree.gen';

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
