import type { AnyRoute } from '@tanstack/react-router';

import {
  findPluginEntryRoute,
  type RemotePlugin,
  type RouteRegistry,
} from '@yourssu-inhouse/mfa-core';

/*
  plugin 의 entry route(= remote 의 /_auth) children 을 host 의 entry route 아래로 graft 해요.
  update 는 UpdatableRouteOptions 만 받지만 getParentRoute 재지정은 런타임 Object.assign 으로
  동작해요(gen 도 `as any` 로 동일하게 처리해요). addChildren 가 children 을 교체하므로 기존
  host entry 자식(/ index placeholder 등)을 보존해요.

  이전 mfa-plugin graft 가 AnyRoute/as any 로 mutate 만 하고 가드가 없던 것과 달리:
  - duplicate graft guard: 이미 graft 한 plugin name 은 다시 graft 하지 않아요(HMR·재부트스트랩·
    중복 loadRemote 상황에서 route 중복/오염 방지).
  - RouteRegistry 로 route id 충돌·basePath 중복 을 검사해요. 실패 시 throw 하고 호출측
    (composePlugins) 가 plugin 단위로 격리해요.
  host 는 plugin 의 내부 구조를 탐색하지 않고, 계약상 노출된 routes 만 소비해요.
*/
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

/*
  테스트·재부트스트랩 시 registry·guard 상태를 초기화해요. 프로덕션 shell 에선 호출하지 않아요.
*/
export const resetGraftState = (): void => {
  graftedPlugins.clear();
};
