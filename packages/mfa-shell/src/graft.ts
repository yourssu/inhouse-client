import type { AnyRoute } from '@tanstack/react-router';

import {
  findPluginEntryRoute,
  type RemotePlugin,
  type RouteRegistry,
} from '@yourssu-inhouse/mfa-core';

const graftedPlugins = new Set<string>();

export const isPluginGrafted = (name: string): boolean => graftedPlugins.has(name);

export const graftPlugin = (
  hostEntry: AnyRoute,
  plugin: RemotePlugin,
  registry: RouteRegistry,
): void => {
  if (graftedPlugins.has(plugin.name)) {
    return;
  }

  registry.assertPlugin(plugin);

  const entry = findPluginEntryRoute(plugin);
  const children = (entry.children ?? []) as AnyRoute[];

  for (const child of children) {
    child.update({ getParentRoute: () => hostEntry } as any);
  }

  hostEntry.addChildren([...((hostEntry.children ?? []) as AnyRoute[]), ...children]);

  registry.register(plugin);
  graftedPlugins.add(plugin.name);
};

export const resetGraftState = (): void => {
  graftedPlugins.clear();
};
