import type { RemotePlugin, RemotePluginDefinition } from './types';

import { validatePlugin } from './validation';

interface RuntimeRemotePluginOptions {
  global?: RemotePlugin['global'];
  name: string;
  routes: RemotePlugin['routes'];
}

export const defineRemotePlugin = (definition: RemotePluginDefinition): RemotePluginDefinition =>
  definition;

export const createRuntimeRemotePlugin = (options: RuntimeRemotePluginOptions): RemotePlugin => {
  const plugin: RemotePlugin = {
    global: options.global,
    name: options.name,
    routes: options.routes,
  };
  validatePlugin(plugin);
  return plugin;
};
