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

interface CreateRemotePreviewAppOptions extends SharedPreviewOptions {
  /** preview 인증을 실제 동작시키기 위한 dev authConfig. 미가입 시 PreviewAuthNotice 로 안내. */
  authConfig: AuthConfig;
  /** 이 remote 의 plugin manifest. init/mocks lifecycle 만 재사용해요(graft 는 skip). */
  plugin: RemotePlugin;
  routerOptions?: CreateExteriorAppOptions<AppRouteTree>['routerOptions'];
  routeTree: AppRouteTree;
}

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
