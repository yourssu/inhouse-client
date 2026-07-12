import type { AnyRoute } from '@tanstack/react-router';

import type { RemotePlugin } from './types';

const collectRouteIds = (route: AnyRoute, acc: Set<string> = new Set()): Set<string> => {
  const id = (route.options as any)?.id;
  if (typeof id === 'string') {
    acc.add(id);
  }
  for (const child of (route.children as AnyRoute[] | undefined) ?? []) {
    collectRouteIds(child, acc);
  }
  return acc;
};

export const findRouteById = (root: AnyRoute | undefined, id: string): AnyRoute | undefined =>
  (root?.children as AnyRoute[] | undefined)?.find((child) => (child.options as any)?.id === id);

export const findPluginEntryRoute = (plugin: Pick<RemotePlugin, 'name' | 'routes'>): AnyRoute => {
  const entry = findRouteById(plugin.routes.routeTree, plugin.routes.entry);
  if (!entry) {
    throw new Error(
      `[mfa-core] '${plugin.name}': entry route '${plugin.routes.entry}' not found in routeTree`,
    );
  }
  return entry;
};

export const validatePlugin = (plugin: RemotePlugin): void => {
  const entry = findPluginEntryRoute(plugin);
  const basePath = plugin.routes.basePath.replace(/\/$/, '');
  const children = (entry.children as AnyRoute[] | undefined) ?? [];

  if (children.length === 0) {
    throw new Error(`[mfa-core] '${plugin.name}': entry route has no children to graft`);
  }

  for (const child of children) {
    const id = (child.options as any)?.id as string | undefined;
    if (typeof id !== 'string') {
      throw new Error(`[mfa-core] '${plugin.name}': grafted child has no route id`);
    }
    if (id !== basePath && !id.startsWith(`${basePath}/`)) {
      throw new Error(
        `[mfa-core] '${plugin.name}': child route '${id}' does not live under basePath '${basePath}'`,
      );
    }
  }
};

export class RouteRegistry {
  private readonly basePaths = new Set<string>();
  private readonly graftIds = new Set<string>();

  assertPlugin(plugin: RemotePlugin): void {
    const basePath = plugin.routes.basePath.replace(/\/$/, '');
    if (this.basePaths.has(basePath)) {
      throw new Error(`[mfa-core] basePath '${basePath}' is already registered by another plugin`);
    }
    const entry = findPluginEntryRoute(plugin);
    for (const child of (entry.children as AnyRoute[] | undefined) ?? []) {
      for (const id of collectRouteIds(child)) {
        if (this.graftIds.has(id)) {
          throw new Error(`[mfa-core] route id '${id}' is already grafted by another plugin`);
        }
      }
    }
  }

  has(id: string): boolean {
    return this.graftIds.has(id);
  }

  register(plugin: RemotePlugin): void {
    const basePath = plugin.routes.basePath.replace(/\/$/, '');
    this.basePaths.add(basePath);
    const entry = findPluginEntryRoute(plugin);
    for (const child of (entry.children as AnyRoute[] | undefined) ?? []) {
      for (const id of collectRouteIds(child)) {
        this.graftIds.add(id);
      }
    }
  }
}
