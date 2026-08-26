import './styles/index.css';

import { bootstrapShell } from '@yourssu-inhouse/mfa-shell';

import { remotePluginSpecs } from '@/plugins.config';
import { routeTree as shellRouteTree } from '@/routeTree.gen';

/* mfa-shell 이 remote plugin 을 로드하고 shell /_auth 아래에 route subtree 를 graft 해요. */
const bootstrap = async () => {
  const { app } = await bootstrapShell({
    routeTree: shellRouteTree,
    specs: remotePluginSpecs,
  });
  return app;
};

const app = await bootstrap();

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
