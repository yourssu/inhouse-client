import type { QueryClient, QueryClientConfig } from '@tanstack/react-query';

import { type AnyRouter, RouterProvider } from '@tanstack/react-router';
import { initializeTheme } from '@yourssu-inhouse/interior';
import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders, type AppProvidersProps } from '../providers/AppProviders';
import { createQueryClient } from './createQueryClient';

/*
  exterior 는 layout/providers/router 만 책임지는 순수 app shell 이에요. 이전에는
  createExteriorApp 가 Plugin lifecycle(init/runtimeAssets/mocks) 도 mount 시 실행했지만,
  MFA orchestration 은 mfa-shell 로 옮겼어요. 이제 createExteriorApp 는 queryClient·
  providers·render 만 담당하고, router 생성과 lifecycle 을 비롯한 조립 행위는 호출측
  (mfa-shell 의 bootstrapShell / createRemotePreviewApp, 또는 standalone app) 이
  beforeRender 와 createRouter 빌더로 주입해요.

  - beforeRender: mount 직전에 실행되는 훅. orchestrator 가 여기서 plugin lifecycle 을 태워요.
  - createRouter: queryClient 를 받아 router 인스턴스를 만드는 빌더. createExteriorApp 은
    dist 로 router 타입을 펼칠 수 없기 때문에, caller 가 concrete routeTree 로 createRouter
    를 직접 호출해 typed router 를 넘겨야 해요(JIT 소스에서만 typed 가 보존돼요).
  - wrapRouter: RouterProvider 를 감싸는 wrapper(예: preview 가 AuthProvider 로 감쌀 때).
  - children: AppProviders 안, RouterProvider 와 나란히 렌더되는 슬롯(예: shell 의 unavailable UI,
    preview 의 PreviewBanner).
*/
interface CreateExteriorAppRenderContext<TRouter> {
  queryClient: QueryClient;
  router: TRouter;
}

export interface CreateExteriorAppOptions<TRouter> {
  appProvidersProps?: Omit<AppProvidersProps, 'children' | 'queryClient'>;
  beforeRender?: () => Promise<void> | void;
  children?: ((context: CreateExteriorAppRenderContext<TRouter>) => ReactNode) | ReactNode;
  /**
    queryClient 를 받아 router 를 만드는 빌더. createExteriorApp 은 dist 로 router
    타입을 펼칠 수 없으므로, caller 가 concrete routeTree 로 createRouter 를 직접
    호출해 typed router 를 넘겨야 해요(JIT 소스에서만 typed 가 보존돼요).
  */
  createRouter: (queryClient: QueryClient) => TRouter;
  queryClientConfig?: QueryClientConfig;
  rootElement?: HTMLElement | null;
  rootElementId?: string;
  /** RouterProvider 를 감싸는 wrapper. preview 가 AuthProvider 로 감쌀 때 써요. */
  wrapRouter?: (node: ReactNode) => ReactNode;
}

export const createExteriorApp = <TRouter extends AnyRouter,>({
  queryClientConfig,
  createRouter,
  beforeRender,
  children,
  appProvidersProps,
  rootElement,
  rootElementId = 'root',
  wrapRouter,
}: CreateExteriorAppOptions<TRouter>) => {
  const queryClient = createQueryClient({ queryClientConfig });
  const router = createRouter(queryClient);

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
