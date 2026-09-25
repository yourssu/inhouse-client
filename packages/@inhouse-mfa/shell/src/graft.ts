import type { AnyRoute } from '@tanstack/react-router';

import {
  assertGraftCandidate,
  findPluginEntryRoute,
  type RemotePlugin,
  type RouteRegistry,
} from '@inhouse-mfa/core';

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
    child.update({ getParentRoute: () => hostEntry } as any);
  }

  hostEntry.addChildren([...((hostEntry.children ?? []) as AnyRoute[]), ...children]);

  registry.register(plugin);
  return true;
};
