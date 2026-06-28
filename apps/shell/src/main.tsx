import './styles/index.css';

import { createExteriorApp } from '@yourssu-inhouse/exterior';

import { routeTree } from '@/routeTree.gen';

const app = createExteriorApp({ routeTree });

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

void app.mount();
