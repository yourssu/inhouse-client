import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { initScouterAnalytics } from './analytics/client';
import { routeTree } from './routeTree.gen';

export const plugin: RemotePlugin = defineRemotePlugin({
  cssEntry: './src/styles/runtime.css',
  lifecycle: {
    init: initScouterAnalytics,
    mocks: async () => [],
  },
  name: 'scouter',
  routes: { basePath: '/recruit', entry: '/_auth', routeTree },
});
