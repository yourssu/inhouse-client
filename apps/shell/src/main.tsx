import './styles/index.css';

import { RouterProvider } from '@tanstack/react-router';
import { AppProviders } from '@yourssu-inhouse/exterior';
import { initializeTheme } from '@yourssu-inhouse/interior';
import { createRoot } from 'react-dom/client';

import { queryClient } from '@/bootstrap/queryClient';
import { router } from '@/bootstrap/tanstack-router';

initializeTheme();

createRoot(document.getElementById('root')!).render(
  <AppProviders queryClient={queryClient}>
    <RouterProvider context={{ queryClient }} router={router} />
  </AppProviders>,
);
