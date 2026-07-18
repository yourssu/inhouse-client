import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { routeTree } from '@/routeTree.gen';

export const plugin: RemotePlugin = defineRemotePlugin({
  cssEntry: './src/styles/runtime.css',
  name: 'scouter',
  routes: { basePath: '/recruit', entry: '/_auth', routeTree },
});
