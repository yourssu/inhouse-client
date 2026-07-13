import './styles/index.css';

import { createRouter, RouterProvider } from '@tanstack/react-router';
import { initializeTheme, ThemeProvider, ToastProvider } from '@yourssu-inhouse/interior';
import { OverlayProvider } from 'overlay-kit';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { routeTree } from '@/routeTree.gen';

const router = createRouter({ routeTree });

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
  <StrictMode>
    <ThemeProvider>
      <ToastProvider duration={3000}>
        <OverlayProvider>
          <RouterProvider router={router} />
        </OverlayProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
