import type { RemotePlugin } from './types';

import { validatePlugin } from './validation';

interface DefineRemotePluginOptions {
  capabilities?: RemotePlugin['capabilities'];
  lifecycle?: RemotePlugin['lifecycle'];
  name: string;
  routes: RemotePlugin['routes'];
}

export const defineRemotePlugin = (options: DefineRemotePluginOptions): RemotePlugin => {
  const plugin: RemotePlugin = {
    capabilities: options.capabilities,
    lifecycle: options.lifecycle,
    name: options.name,
    routes: options.routes,
  };
  validatePlugin(plugin);
  return plugin;
};
