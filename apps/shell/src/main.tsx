import './styles/index.css';

import { bootstrapShell, buildRemoteSpecs } from '@inhouse-mfa/shell';

import { routeTree as shellRouteTree } from '@/routeTree.gen';

const bootstrap = async () => {
  const { app } = await bootstrapShell({
    routeTree: shellRouteTree,
    specs: buildRemoteSpecs(MFA_REMOTE_IDS.map((id) => ({ id }))),
  });
  return app;
};
await bootstrap();

declare module '@tanstack/react-router' {
  interface Register {
    router: Awaited<ReturnType<typeof bootstrap>>['router'];
  }
}
