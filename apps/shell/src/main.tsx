import './styles/index.css';

import { bootstrapShell } from '@yourssu-inhouse/mfa-shell';

import { remotePluginSpecs } from '@/plugins.config';
import { routeTree as shellRouteTree } from '@/routeTree.gen';

/*
  shell 은 앱이 아니라 runtime orchestrator예요. mfa-shell 의 bootstrapShell 이 Module Federation
  으로 remote Plugin 들을 로드하고 Plugin 계약으로만 composition(graft) 을 수행해요. remote 내부
  route 구조를 직접 탐색하지 않아요.

  bootstrapShell 이:
  1. shell 자기 /_auth anchor 를 찾고,
  2. shared dependency 버전 정책을 런타임에 검사(assertSharedVersions) 하고,
  3. composePlugins 가 각 plugin 의 entry children 을 shell 의 /_auth 아래로 정적 graft 하되
     route id/basePath 충돌 검사 + 중복 graft 방지 + per-plugin 격리 를 적용하고,
  4. createExteriorApp 의 beforeRender 에서 init · assets(<link> 주입) · mocks lifecycle 을 태워요.
  createRouter 가 buildRouteTree → processRouteTree 로 각 route.init() 을 부모→자식 순서로
  호출하며 getParentRoute/fullPath/routeId 를 재계산해요. 그래서 routeId 가
  `/_auth/recruit/...` · `/_auth/members/...` 로 유지돼 타입 안전해요.
*/
const bootstrap = async () => {
  const { app } = await bootstrapShell({
    routeTree: shellRouteTree,
    specs: remotePluginSpecs,
  });
  return app;
};

const app = await bootstrap();

export const router = app.router;

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
