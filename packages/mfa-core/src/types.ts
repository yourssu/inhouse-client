import type { AnyRoute } from '@tanstack/react-router';
import type { RequestHandler } from 'msw';

/*
  MFA remote 가 shell 에 노출하는 Plugin manifest 계약이에요.
  remote 는 "앱"이 아니라 이 인터페이스를 만족하는 self-contained plugin 이고,
  shell(mfa-shell) 은 이 계약으로만 composition 을 수행하고 remote 내부 구조를 몰라요.

  이전 Plugin 인터페이스(name/routeTree/init/mocks/runtimeAssets)가 암묵 규칙에 의존하던
  것을 의미 기반 필드로 바꿔요:
  - routes.entry / routes.basePath: graft 와 충돌 검사가 더 이상 "/_auth 관례" 에 의존하지 않아요.
  - capabilities.preview: standalone "독립 앱" 착시를 없애고 preview harness 임을 명시해요.
*/
export type ExteriorAppMode = 'preview' | 'shell';

interface PluginRuntimeContext {
  /** plugin 이 어디서 실행 중인지. */
  mode: ExteriorAppMode;
  /** plugin 식별자. query key namespace·로그에 써요. */
  name: string;
}

interface RemotePluginRoutes {
  /*
    plugin 의 기능 라우트가 사는 base path(예: '/recruit', '/members'). graft 충돌 검사가
    서로 다른 plugin 의 basePath 가 겹치지 않는지 확인해요.
  */
  basePath: string;
  /*
    pathless auth anchor route id. shell 이 자기 _auth 아래로 graft 할 때 쓰고,
    mfa-core 가 routeTree 에서 이 id 의 자식을 찾아 검증해요. 기본 '/_auth'.
  */
  entry: string;
  /*
    remote 의 gen routeTree(root). mfa-core 가 entry 자식을 찾아 검증해요.
    실패하면 런타임이 아니라 정의 시점에 throw 해요.
  */
  routeTree: AnyRoute;
}

interface RemotePluginLifecycle {
  /*
    auth/analytics/queryClient 같은 side effect. shell·preview 모두 mount 시 실행해요.
  */
  init?: (ctx: PluginRuntimeContext) => Promise<void> | void;
  /*
    MSW RequestHandler 들을 반환해요. dev 에서만 중앙 worker 로 묶어 실행해요.
  */
  mocks?: (ctx: PluginRuntimeContext) => Promise<RequestHandler[]>;
}

interface RemotePluginCapabilities {
  /*
    이 remote 가 dev preview harness 를 갖는지. 기본 true. standalone "독립 앱" 이 아니라
    remote 개발 미리보기임을 명시해요.
  */
  preview?: boolean;
}

export interface RemotePlugin {
  capabilities?: RemotePluginCapabilities;
  lifecycle?: RemotePluginLifecycle;
  /** Module Federation remote 이름. mfa.config 의 remote id 와 일치해야 해요. */
  name: string;
  routes: RemotePluginRoutes;
}
