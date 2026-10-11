import './styles/index.css';

import { AppProviders } from '@exterior/core';
import { AuthProvider } from '@inhouse/auth';
import { queryClient } from '@inhouse/query-client';
import { initializeTheme } from '@interior/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';

import { authConfig } from '@/config';
import { routeTree } from '@/routeTree.gen';

export const router = createRouter({
  routeTree,
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

initializeTheme();

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element #root를 찾을 수 없어요.');
}

createRoot(container).render(
  <AppProviders>
    <QueryClientProvider client={queryClient}>
      <AuthProvider config={authConfig}>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </AppProviders>,
);
