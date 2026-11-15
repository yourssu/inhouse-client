import { defineRemotePlugin } from '@inhouse-mfa/core';

import { bootstrap } from './src/global';
import { routeTree } from './src/routeTree.gen';

export default defineRemotePlugin({
  routeTree,
  global: { bootstrap },
});
