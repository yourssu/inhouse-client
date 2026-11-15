import { defineRemotePlugin } from '@inhouse-mfa/core';

import { bootstrap, GlobalComponent } from './src/global';
import { routeTree } from './src/routeTree.gen';

export default defineRemotePlugin({
  routeTree,
  global: {
    bootstrap,
    Global: GlobalComponent,
  },
});
