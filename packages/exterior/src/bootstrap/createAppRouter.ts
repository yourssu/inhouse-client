import type { QueryClient } from '@tanstack/react-query';

import {
  type AnyRoute,
  createRouter,
  type RouterConstructorOptions,
  type RouterHistory,
  type TrailingSlashOption,
} from '@tanstack/react-router';

import type { RouteContext } from './types';

export type AppRouteTree = AnyRoute & {
  types: {
    routerContext: RouteContext;
  };
};

export interface CreateAppRouterOptions<
  TRouteTree extends AppRouteTree,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
> {
  queryClient: QueryClient;
  routerOptions?: Omit<
    RouterConstructorOptions<
      TRouteTree,
      TTrailingSlashOption,
      TDefaultStructuralSharingOption,
      TRouterHistory,
      TDehydrated
    >,
    'context' | 'routeTree'
  >;
  routeTree: TRouteTree;
}

export const createAppRouter = <
  TRouteTree extends AppRouteTree,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
>({
  routeTree,
  queryClient,
  routerOptions,
}: CreateAppRouterOptions<
  TRouteTree,
  TTrailingSlashOption,
  TDefaultStructuralSharingOption,
  TRouterHistory,
  TDehydrated
>) => {
  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    ...routerOptions,
  });
};
