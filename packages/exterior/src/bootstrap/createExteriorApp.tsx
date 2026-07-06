import type { QueryClient, QueryClientConfig } from '@tanstack/react-query';

import {
  type RouterHistory,
  RouterProvider,
  type TrailingSlashOption,
} from '@tanstack/react-router';
import { initializeTheme } from '@yourssu-inhouse/interior';
import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders, type AppProvidersProps } from '../providers/AppProviders';
import { type AppRouteTree, createAppRouter, type CreateAppRouterOptions } from './createAppRouter';
import { createQueryClient } from './createQueryClient';

/*
  exterior 는 layout/providers/router 만 책임지는 순수 app shell 이에요. 이전에는
  createExteriorApp 가 Plugin lifecycle(init/runtimeAssets/mocks) 도 mount 시 실행했지만,
  MFA orchestration 은 mfa-shell 로 옮겼어요. 이제 createExteriorApp 는 queryClient·router·
  providers·render 만 담당하고, lifecycle 을 비롯한 조립 행위는 호출측(mfa-shell 의
  bootstrapShell / createRemotePreviewApp) 이 beforeRender 로 주입해요.

  - beforeRender: mount 직전에 실행되는 훅. orchestrator 가 여기서 plugin lifecycle 을 태워요.
  - wrapRouter: RouterProvider 를 감싸는 wrapper(예: preview 가 AuthProvider 로 감쌀 때).
  - children: AppProviders 안, RouterProvider 와 나란히 렌더되는 슬롯(예: shell 의 unavailable UI,
    preview 의 PreviewBanner).
*/
interface CreateExteriorAppRenderContext<TRouter> {
  queryClient: QueryClient;
  router: TRouter;
}

export interface CreateExteriorAppOptions<
  TRouteTree extends AppRouteTree,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
> {
  appProvidersProps?: Omit<AppProvidersProps, 'children' | 'queryClient'>;
  beforeRender?: () => Promise<void> | void;
  children?: ((context: CreateExteriorAppRenderContext<unknown>) => ReactNode) | ReactNode;
  queryClientConfig?: QueryClientConfig;
  rootElement?: HTMLElement | null;
  rootElementId?: string;
  routerOptions?: CreateAppRouterOptions<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  >['routerOptions'];
  routeTree: TRouteTree;
  /** RouterProvider 를 감싸는 wrapper. preview 가 AuthProvider 로 감쌀 때 써요. */
  wrapRouter?: (node: ReactNode) => ReactNode;
}

export const createExteriorApp = <
  TRouteTree extends AppRouteTree,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
>({
  queryClientConfig,
  routeTree,
  routerOptions,
  beforeRender,
  children,
  appProvidersProps,
  rootElement,
  rootElementId = 'root',
  wrapRouter,
}: CreateExteriorAppOptions<
  TRouteTree,
  TTrailingSlashOption,
  TDefaultStructuralSharingOption,
  TRouterHistory,
  TDehydrated
>) => {
  const queryClient = createQueryClient({ queryClientConfig });
  const router = createAppRouter({ routeTree, queryClient, routerOptions });

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({ queryClient, router });
    }

    return children;
  };

  const routerNode = <RouterProvider context={{ queryClient }} router={router} />;

  const mount = async () => {
    initializeTheme();
    await beforeRender?.();

    const container = rootElement ?? document.getElementById(rootElementId);

    if (!container) {
      throw new Error(`Root element #${rootElementId}를 찾을 수 없어요.`);
    }

    const root = createRoot(container);

    root.render(
      <AppProviders {...appProvidersProps} queryClient={queryClient}>
        {wrapRouter ? wrapRouter(routerNode) : routerNode}
        {renderChildren()}
      </AppProviders>,
    );

    return root;
  };

  return {
    queryClient,
    router,
    mount,
  };
};
