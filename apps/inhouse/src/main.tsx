import './styles/index.css';

import { createRemotePreviewApp } from '@yourssu-inhouse/mfa-shell';

import { authConfig } from '@/config';
import { plugin } from '@/plugin';
import { routeTree } from '@/routeTree.gen';

const app = createRemotePreviewApp({ authConfig, plugin, routeTree });

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
