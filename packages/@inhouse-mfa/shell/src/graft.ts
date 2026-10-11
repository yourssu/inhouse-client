import type { AnyRoute } from '@tanstack/react-router';

import {
  assertGraftCandidate,
  findPluginEntryRoute,
  type RemotePlugin,
  type RouteRegistry,
} from '@inhouse-mfa/core';

import { withRemoteGlobal } from './withRemoteGlobal';

export const graftPlugin = (
  hostEntry: AnyRoute,
  plugin: RemotePlugin,
  registry: RouteRegistry,
): boolean => {
  if (registry.hasPlugin(plugin.name)) {
    return false;
  }

  registry.assertPlugin(plugin);
  assertGraftCandidate(hostEntry, plugin);

  const entry = findPluginEntryRoute(plugin);
  const children = (entry.children ?? []) as AnyRoute[];

  // 후보 트리와 동일한 구조가 검증을 통과했으므로 이 시점의 원본 반영은 실패 경로가 없다.
  for (const child of children) {
    const root = plugin.routes.routeTree.options;
    const head = child.options.head;
    const rootHead = root.head;

    child.update({
      component: withRemoteGlobal(child.options.component, plugin.global),
      errorComponent: child.options.errorComponent ?? root.errorComponent,
      notFoundComponent: child.options.notFoundComponent ?? root.notFoundComponent,
      pendingComponent: child.options.pendingComponent ?? root.pendingComponent,
      head: rootHead
        ? async (context: Parameters<typeof rootHead>[0]) => {
            const [rootResult, result] = await Promise.all([rootHead(context), head?.(context)]);
            return {
              ...rootResult,
              ...result,
              meta: [...(rootResult?.meta ?? []), ...(result?.meta ?? [])],
              links: [...(rootResult?.links ?? []), ...(result?.links ?? [])],
              scripts: [...(rootResult?.scripts ?? []), ...(result?.scripts ?? [])],
              styles: [...(rootResult?.styles ?? []), ...(result?.styles ?? [])],
            };
          }
        : head,
      getParentRoute: () => hostEntry,
    } as never);
  }

  hostEntry.addChildren([...((hostEntry.children ?? []) as AnyRoute[]), ...children]);

  registry.register(plugin);
  return true;
};
