import './styles/index.css';

import { createExteriorApp } from '@yourssu-inhouse/exterior';

import { STAGE } from '@/config';
import { routeTree } from '@/routeTree.gen';

const enableMocking = async (): Promise<void> => {
  if (STAGE !== 'dev') {
    return;
  }

  const { worker } = await import('@/mocks/browser');
  await worker.start({
    onUnhandledRequest: 'bypass',
  });
};

const app = createExteriorApp({ routeTree, beforeRender: enableMocking });

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

void app.mount();
