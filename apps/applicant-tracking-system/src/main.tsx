import './styles/index.css';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterProvider } from '@tanstack/react-router';
import { initializeTheme, ThemeProvider, ToastProvider } from '@yourssu-inhouse/interior';
import { OverlayProvider } from 'overlay-kit';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { router } from '@/bootstrap/tanstack-router';
import { QueryProvider } from '@/components/Providers/QueryProvider';

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <ToastProvider duration={3000}>
          <OverlayProvider>
            <RouterProvider router={router} />
          </OverlayProvider>
        </ToastProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryProvider>
  </StrictMode>,
);
