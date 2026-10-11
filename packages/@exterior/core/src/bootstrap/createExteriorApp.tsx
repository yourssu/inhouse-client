import { initializeTheme } from '@interior/react';
import {
  createRouter,
  type RouterConstructorOptions,
  type RouterHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

import type { AppRouteTree } from './types';

import { AppProviders, type AppProvidersProps } from '../providers/AppProviders';

export type AppRouter<TRouteTree extends AppRouteTree> = ReturnType<
  typeof createRouter<TRouteTree>
>;

interface CreateExteriorAppContext<TRouteTree extends AppRouteTree> {
  router: AppRouter<TRouteTree>;
}

export interface CreateExteriorAppOptions<TRouteTree extends AppRouteTree> {
  appProvidersProps?: Omit<AppProvidersProps, 'children'>;
  beforeRender?: (context: CreateExteriorAppContext<TRouteTree>) => Promise<void> | void;
  children?: ((context: CreateExteriorAppContext<TRouteTree>) => ReactNode) | ReactNode;
  rootElement?: HTMLElement | null;
  rootElementId?: string;
  routerOptions?: Omit<
    RouterConstructorOptions<TRouteTree, 'never', false, RouterHistory, Record<string, unknown>>,
    'context' | 'routeTree'
  >;
  routeTree: TRouteTree;
}

export const createExteriorApp = <TRouteTree extends AppRouteTree>({
  routeTree,
  routerOptions,
  beforeRender,
  children,
  appProvidersProps,
  rootElement,
  rootElementId = 'root',
}: CreateExteriorAppOptions<TRouteTree>) => {
  const router = createRouter<TRouteTree>({
    routeTree,
    context: {},
    defaultPreloadStaleTime: 0,
    ...routerOptions,
  });

  const renderChildren = () => {
    if (typeof children === 'function') {
      return children({ router });
    }

    return children;
  };

  const mount = async () => {
    initializeTheme();
    await beforeRender?.({ router });

    const container = rootElement ?? document.getElementById(rootElementId);

    if (!container) {
      throw new Error(`Root element #${rootElementId}를 찾을 수 없어요.`);
    }

    const root = createRoot(container);

    root.render(
      <AppProviders {...appProvidersProps}>
        <RouterProvider router={router} />
        {renderChildren()}
      </AppProviders>,
    );

    return root;
  };

  return {
    router,
    mount,
  };
};
