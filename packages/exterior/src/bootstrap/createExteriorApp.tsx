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
}

export const createExteriorApp = <
  TRouteTree extends AppRouteTree,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
>({
  routeTree,
  queryClientConfig,
  routerOptions,
  beforeRender,
  children,
  appProvidersProps,
  rootElement,
  rootElementId = 'root',
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
        <RouterProvider context={{ queryClient }} router={router} />
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
