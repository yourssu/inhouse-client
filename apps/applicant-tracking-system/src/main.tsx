import './styles/index.css';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createExteriorApp } from '@yourssu-inhouse/exterior';

import { routeTree } from '@/routeTree.gen';

const app = createExteriorApp({
  routeTree,
  queryClientConfig: {
    defaultOptions: {
      queries: {
        throwOnError: true,
      },
    },
  },
  children: <ReactQueryDevtools initialIsOpen={false} />,
});

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

void app.mount();
