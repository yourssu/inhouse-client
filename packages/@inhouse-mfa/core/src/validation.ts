import {
  type AnyRoute,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router';

import type { RemotePlugin } from './types';

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

/**
 * 후보 트리 검증에만 쓰는 graft 대상 서브트리 복제본을 만든다.
 *
 * BaseRoute의 init·update·addChildren은 생성 시점의 인스턴스에 묶인 화살표
 * 함수라서 프로토타입 복제(Object.create)로는 원본이 초기화된다. routeTree.gen.ts와
 * 같은 방식으로 createRoute 후 update로 id와 path를 함께 지정한 새 인스턴스를
 * 만들어, 검증이 실패해도 plugin 원본의 options과 초기화 상태가 남지 않게 한다.
 */
const cloneRouteTree = (route: AnyRoute, parent: AnyRoute): AnyRoute => {
  const options = { ...(route.options as object) };
  const clone = createRoute({
    ...options,
    id: undefined,
    getParentRoute: () => parent,
  } as never).update({
    ...options,
    getParentRoute: () => parent,
  } as never) as AnyRoute;
  clone._addFileChildren(
    ((route.children as AnyRoute[] | undefined) ?? []).map((child) => cloneRouteTree(child, clone)),
  );
  return clone;
};

/**
 * 후보 Router가 계산한 최종 route id가 선언한 basePath 아래에 있는지 검사한다.
 */
const assertSubtreeUnderBasePath = (
  plugin: Pick<RemotePlugin, 'name' | 'routes'>,
  route: AnyRoute,
  prefix: string,
): void => {
  const id = route.id;
  if (typeof id !== 'string') {
    throw new Error(`[mfa-core] '${plugin.name}': grafted route has no final id`);
  }
  if (id !== prefix && !id.startsWith(`${prefix}/`)) {
    throw new Error(
      `[mfa-core] '${plugin.name}': route id '${id}' does not live under basePath '${plugin.routes.basePath}'`,
    );
  }
  for (const child of (route.children as AnyRoute[] | undefined) ?? []) {
    assertSubtreeUnderBasePath(plugin, child, prefix);
  }
};

/**
 * 원본을 수정하기 전에 graft 후보 트리를 실제 Router로 검증한다.
 *
 * plugin 라우트는 복제본으로만 후보에 연결하고, 기존 shell 트리는 후보 Router의
 * 초기화가 실제 Router와 같은 값을 다시 계산하므로 그대로 재사용한다. 최종 route id
 * 충돌(shell·이미 graft된 plugin·plugin 내부)은 후보 Router의 Duplicate routes
 * 오류가 판정한다. 통과한 구조만 graftPlugin이 원본에 반영한다.
 */
export const assertGraftCandidate = (hostEntry: AnyRoute, plugin: RemotePlugin): void => {
  const entry = findPluginEntryRoute(plugin);
  const children = (entry.children as AnyRoute[] | undefined) ?? [];
  if (children.length === 0) {
    throw new Error(`[mfa-core] '${plugin.name}': entry route has no children to graft`);
  }

  const clones = children.map((child) => cloneRouteTree(child, hostEntry));
  const candidateRouteTree = createRootRoute().addChildren([hostEntry, ...clones] as never);
  try {
    // RootRoute의 구체 타입이 AnyRoute로 좁혀지지 않는 라이브러리 타입 한계로 unknown을 경유한다.
    createRouter({
      history: createMemoryHistory(),
      routeTree: candidateRouteTree as unknown as AnyRoute,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`[mfa-core] '${plugin.name}': graft candidate rejected: ${reason}`, {
      cause: error,
    });
  }

  const basePath = plugin.routes.basePath.replace(/\/$/, '');
  for (const clone of clones) {
    assertSubtreeUnderBasePath(plugin, clone, `${hostEntry.id}${basePath}`);
  }
};

export class RouteRegistry {
  private readonly basePaths = new Set<string>();
  private readonly pluginNames = new Set<string>();

  assertPlugin(plugin: RemotePlugin): void {
    if (this.pluginNames.has(plugin.name)) {
      throw new Error(`[mfa-core] plugin '${plugin.name}' is already registered`);
    }

    const basePath = plugin.routes.basePath.replace(/\/$/, '');
    if (this.basePaths.has(basePath)) {
      throw new Error(`[mfa-core] basePath '${basePath}' is already registered by another plugin`);
    }
  }

  hasPlugin(name: string): boolean {
    return this.pluginNames.has(name);
  }

  register(plugin: RemotePlugin): void {
    this.basePaths.add(plugin.routes.basePath.replace(/\/$/, ''));
    this.pluginNames.add(plugin.name);
  }
}
