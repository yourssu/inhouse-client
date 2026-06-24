import './styles/index.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { initializeTheme, ThemeProvider, ToastProvider } from '@yourssu-inhouse/interior';
import { OverlayProvider } from 'overlay-kit';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { queryClient } from '@/bootstrap/tanstack-query';
import { router } from '@/bootstrap/tanstack-router';

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider duration={3000}>
          <OverlayProvider>
            <RouterProvider context={{ queryClient }} router={router} />
          </OverlayProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
