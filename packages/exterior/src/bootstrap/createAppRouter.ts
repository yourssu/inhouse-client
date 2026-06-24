import type { QueryClient } from '@tanstack/react-query';
import {
  createRouter,
  type AnyRoute,
  type RouterConstructorOptions,
  type RouterHistory,
  type TrailingSlashOption,
} from '@tanstack/react-router';

export interface CreateAppRouterOptions<
  TRouteTree extends AnyRoute,
  TTrailingSlashOption extends TrailingSlashOption = 'never',
  TDefaultStructuralSharingOption extends boolean = false,
  TRouterHistory extends RouterHistory = RouterHistory,
  TDehydrated extends Record<string, unknown> = Record<string, unknown>,
> {
  routeTree: TRouteTree;
  queryClient: QueryClient;
  routerOptions?: Omit<
    RouterConstructorOptions<
      TRouteTree,
      TTrailingSlashOption,
      TDefaultStructuralSharingOption,
      TRouterHistory,
      TDehydrated
    >,
    'routeTree' | 'context'
  >;
}

export const createAppRouter = <
  TRouteTree extends AnyRoute,
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
  return createRouter<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  >({
    routeTree,
    context: {
      queryClient,
    },
    ...routerOptions,
  } as RouterConstructorOptions<
    TRouteTree,
    TTrailingSlashOption,
    TDefaultStructuralSharingOption,
    TRouterHistory,
    TDehydrated
  >);
};
