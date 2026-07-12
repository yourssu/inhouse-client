import { defineRemotePlugin, type RemotePlugin } from '@yourssu-inhouse/mfa-core';

import { routeTree } from '@/routeTree.gen';

export const plugin: RemotePlugin = defineRemotePlugin({
  name: 'scouter',
  routes: { basePath: '/recruit', entry: '/_auth', routeTree },
});
