import type { AnyRoute } from '@tanstack/react-router';

import {
  findPluginEntryRoute,
  type RemotePlugin,
  type RouteRegistry,
} from '@yourssu-inhouse/mfa-core';

export const graftPlugin = (
  hostEntry: AnyRoute,
  plugin: RemotePlugin,
  registry: RouteRegistry,
): boolean => {
  if (registry.hasPlugin(plugin.name)) {
    return false;
  }

  registry.assertPlugin(plugin);

  const entry = findPluginEntryRoute(plugin);
  const children = (entry.children ?? []) as AnyRoute[];

  for (const child of children) {
    child.update({ getParentRoute: () => hostEntry } as any);
  }

  hostEntry.addChildren([...((hostEntry.children ?? []) as AnyRoute[]), ...children]);

  registry.register(plugin);
  return true;
};
