import type { ReactNode } from 'react';

import { type AuthConfig, AuthProvider } from '@yourssu-inhouse/auth';
import {
  type AppRouteTree,
  createExteriorApp,
  type CreateExteriorAppOptions,
} from '@yourssu-inhouse/exterior';
import { type RemotePlugin, runPluginInits, setupPluginMocks } from '@yourssu-inhouse/mfa-core';

import { PreviewAuthNotice, PreviewBanner } from './components/PreviewBanner';

type SharedPreviewOptions = Pick<
  CreateExteriorAppOptions<AppRouteTree>,
  'appProvidersProps' | 'queryClientConfig' | 'rootElement' | 'rootElementId'
>;

export interface CreateRemotePreviewAppOptions extends SharedPreviewOptions {
  /*
    preview 는 shell 크롬/인증 없이 띄우지만, "인증이 되는 독립 앱" 인 척하는 착시를 없애기 위해
    실제 AuthProvider 를 dev authConfig 로 mount 해요. 인증 context 가 진짜로 동작하고,
    미가입 시 솔직하게 PreviewAuthNotice 로 안내해요.
  */
  authConfig: AuthConfig;
  /** 이 remote 의 plugin manifest. init/mocks lifecycle 만 재사용해요(graft 는 skip). */
  plugin: RemotePlugin;
  routerOptions?: CreateExteriorAppOptions<AppRouteTree>['routerOptions'];
  routeTree: AppRouteTree;
}

/*
  remote dev preview harness 를 만들어요. 이전 standalone "독립 앱" 착시를 없애고, 정체를
  remote 개발 미리보기로 명시해요.

  - graft 하지 않아요: 로컬 plugin.routeTree 가 곧 host 자신의 entry 인스턴스라 graft 하면
    self-double-add 가 돼요. 로컬 plugin 만 넘겨 lifecycle 만 재사용해요.
  - AuthProvider 를 dev config 로 mount 해 인증을 진짜로 동작시키고(착시 제거), 미가입 시
    PreviewAuthNotice 로 안내해요. /signin redirect 가 remote 에 없는 route 여도 notFound 로
    잡혀 안내가 떠요.
  - PreviewBanner 로 shell 없는 미리보기임을 항상 표시해요.
*/
export const createRemotePreviewApp = (
  options: CreateRemotePreviewAppOptions,
): ReturnType<typeof createExteriorApp<AppRouteTree>> => {
  const app = createExteriorApp<AppRouteTree>({
    appProvidersProps: options.appProvidersProps,
    beforeRender: async () => {
      await runPluginInits([options.plugin], 'preview');
      await setupPluginMocks([options.plugin], 'preview');
    },
    children: (): ReactNode => <PreviewBanner />,
    queryClientConfig: options.queryClientConfig,
    rootElement: options.rootElement,
    rootElementId: options.rootElementId,
    routerOptions: {
      defaultErrorComponent: () => <PreviewAuthNotice />,
      defaultNotFoundComponent: () => <PreviewAuthNotice />,
      ...options.routerOptions,
    },
    routeTree: options.routeTree,
    wrapRouter: (node) => <AuthProvider config={options.authConfig}>{node}</AuthProvider>,
  });

  void app.mount();
  return app;
};
