import type { AnyRoute } from '@tanstack/react-router';
import type { RequestHandler } from 'msw';

export type ExteriorAppMode = 'preview' | 'shell';

interface PluginRuntimeContext {
  /** plugin 이 어디서 실행 중인지. */
  mode: ExteriorAppMode;
  /** plugin 식별자. */
  name: string;
}

interface RemotePluginRoutes {
  /** plugin 기능 라우트의 base path(예: '/recruit', '/members'). */
  basePath: string;
  /** pathless auth anchor route id. 기본 '/_auth'. */
  entry: string;
  /** remote 의 gen routeTree(root). */
  routeTree: AnyRoute;
}

interface RemotePluginLifecycle {
  /** auth/analytics/queryClient 같은 side effect. */
  init?: (ctx: PluginRuntimeContext) => Promise<void> | void;
  /** MSW RequestHandler 들을 반환해요. */
  mocks?: (ctx: PluginRuntimeContext) => Promise<RequestHandler[]>;
}

interface RemotePluginCapabilities {
  /** dev preview harness 보유 여부. 기본 true. */
  preview?: boolean;
}

export interface RemotePlugin {
  capabilities?: RemotePluginCapabilities;
  lifecycle?: RemotePluginLifecycle;
  /** Module Federation remote 이름. mfa.config 의 remote id 와 일치해야 해요. */
  name: string;
  routes: RemotePluginRoutes;
}
