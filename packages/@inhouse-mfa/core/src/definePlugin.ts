import type { RemotePlugin } from './types';

import { validatePlugin } from './validation';

interface DefineRemotePluginOptions {
  global?: RemotePlugin['global'];
  name: string;
  routes: RemotePlugin['routes'];
}

export const defineRemotePlugin = (options: DefineRemotePluginOptions): RemotePlugin => {
  const plugin: RemotePlugin = {
    global: options.global,
    name: options.name,
    routes: options.routes,
  };
  validatePlugin(plugin);
  return plugin;
};
