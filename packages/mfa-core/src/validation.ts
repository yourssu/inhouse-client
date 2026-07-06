import type { AnyRoute } from '@tanstack/react-router';

import type { RemotePlugin } from './types';

/*
  라우트 서브트리의 모든 route id 를 수집해요. graft 충돌 검사가 이미 graft 된 id 집합과
  비교해 중복을 잡아요.
*/
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

/*
  routeTree 의 최상위 children 에서 주어진 id(기본 '/_auth') 의 라우트를 찾아요.
  gen routeTree 의 top-level children 안에 entry route 가 있어요. shell(host) 가 자기
  _auth anchor 를 찾을 때도 써요. remote 마다 findAuthRoute + as AnyRoute + as any 를
  반복하는 걸 중앙화했어요.
*/
export const findRouteById = (root: AnyRoute | undefined, id: string): AnyRoute | undefined =>
  (root?.children as AnyRoute[] | undefined)?.find((child) => (child.options as any)?.id === id);

/*
  plugin.routeTree 에서 entry route(기본 '/_auth')를 찾아 반환해요. 못 찾으면 throw 해요.
  defineRemotePlugin 이 정의 시점에 호출해 런타임 전에 검증해요.
*/
export const findPluginEntryRoute = (plugin: Pick<RemotePlugin, 'name' | 'routes'>): AnyRoute => {
  const entry = findRouteById(plugin.routes.routeTree, plugin.routes.entry);
  if (!entry) {
    throw new Error(
      `[mfa-core] '${plugin.name}': entry route '${plugin.routes.entry}' not found in routeTree`,
    );
  }
  return entry;
};

/*
  plugin manifest 를 정의 시점에 검증해요. entry route 누락·basePath 위반을 잡아요.
  이 repo 의 route 파일은 `~` 접두사 컨벤션(`~_auth/~recruit/~route.tsx`)을 써서 TanStack gen 이
  런타임 route id 를 풀 경로(`/_auth/recruit`)가 아니라 entry 에 대한 상대 경로(`/recruit`)로 만들어요.
  그래서 entry(예: '/_auth') 의 직계 자식 route id 는 `${basePath}`(예: '/recruit') 또는
  `${basePath}/...` 형태예요. graft 가 route id 를 그대로 유지하므로, basePath 가 이 접두사와
  일치하는지 계약으로 강제해요.
*/
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

/*
  graft 충돌 검사 레지스트리. shell 이 plugin 들을 graft 할 때 route id 가 이미 graft 된
  다른 plugin 과 충돌하지 않는지 확인해요. basePath 중복(한 basePath 를 두 plugin 이 쓰면)
  도 잡아요.
*/
export class RouteRegistry {
  private readonly basePaths = new Set<string>();
  private readonly graftIds = new Set<string>();

  assertPlugin(plugin: RemotePlugin): void {
    const basePath = plugin.routes.basePath.replace(/\/$/, '');
    if (this.basePaths.has(basePath)) {
      throw new Error(`[mfa-core] basePath '${basePath}' is already registered by another plugin`);
    }
    // entry 자신의 id('/_auth' 공유 anchor)는 graft 되지 않으므로 제외하고, graft 될
    // children 서브트리의 id 만 검사해요.
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
