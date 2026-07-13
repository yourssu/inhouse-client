import type { ReactNode } from 'react';

import {
  createRouter,
  type RouterConstructorOptions,
  type RouterHistory,
} from '@tanstack/react-router';
import { type AuthConfig, AuthProvider } from '@yourssu-inhouse/auth';
import {
  type AppRouteTree,
  createExteriorApp,
  type CreateExteriorAppOptions,
} from '@yourssu-inhouse/exterior';
import { type RemotePlugin, runPluginInits, setupPluginMocks } from '@yourssu-inhouse/mfa-core';

import { PreviewAuthNotice, PreviewBanner } from './components/PreviewBanner';

type SharedPreviewOptions = Pick<
  CreateExteriorAppOptions<unknown>,
  'appProvidersProps' | 'queryClientConfig' | 'rootElement' | 'rootElementId'
>;

interface CreateRemotePreviewAppOptions<
  TRouteTree extends AppRouteTree,
> extends SharedPreviewOptions {
  /** preview 인증을 실제 동작시키기 위한 dev authConfig. 미가입 시 PreviewAuthNotice 로 안내. */
  authConfig: AuthConfig;
  /** 이 remote 의 plugin manifest. init/mocks lifecycle 만 재사용해요(graft 는 skip). */
  plugin: RemotePlugin;
  routerOptions?: Omit<
    RouterConstructorOptions<TRouteTree, 'never', false, RouterHistory, Record<string, unknown>>,
    'context' | 'routeTree'
  >;
  routeTree: TRouteTree;
}

export const createRemotePreviewApp = <TRouteTree extends AppRouteTree>(
  options: CreateRemotePreviewAppOptions<TRouteTree>,
) => {
  const app = createExteriorApp({
    appProvidersProps: options.appProvidersProps,
    beforeRender: async () => {
      await runPluginInits([options.plugin], 'preview');
      await setupPluginMocks([options.plugin], 'preview');
    },
    children: (): ReactNode => <PreviewBanner />,
    createRouter: (queryClient) =>
      createRouter({
        routeTree: options.routeTree,
        context: { queryClient },
        defaultErrorComponent: () => <PreviewAuthNotice />,
        defaultNotFoundComponent: () => <PreviewAuthNotice />,
        ...options.routerOptions,
      }),
    queryClientConfig: options.queryClientConfig,
    rootElement: options.rootElement,
    rootElementId: options.rootElementId,
    wrapRouter: (node) => <AuthProvider config={options.authConfig}>{node}</AuthProvider>,
  });

  void app.mount();
  return app;
};
