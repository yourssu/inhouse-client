import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { routeTree } from '@/routeTree.gen';

export const plugin: RemotePlugin = defineRemotePlugin({
  name: 'member',
  routes: { basePath: '/members', entry: '/_auth', routeTree },
  lifecycle: {
    mocks: async () => (await import('@/mocks/handlers')).handlers,
  },
});
