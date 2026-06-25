import './styles/index.css';

import { RouterProvider } from '@tanstack/react-router';
import { AppProviders } from '@yourssu-inhouse/exterior';
import { initializeTheme } from '@yourssu-inhouse/interior';
import { createRoot } from 'react-dom/client';

import { queryClient } from '@/bootstrap/queryClient';
import { router } from '@/bootstrap/tanstack-router';
import { STAGE } from '@/config';

const enableMocking = async (): Promise<void> => {
  if (STAGE !== 'dev') {
    return;
  }
  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
};

initializeTheme();

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <AppProviders queryClient={queryClient}>
      <RouterProvider context={{ queryClient }} router={router} />
    </AppProviders>,
  );
});
