import type { RouteById, RouteIds } from '@tanstack/react-router';
import type { ExcludeEmptyObject, Prettify } from '@yourssu-inhouse/inhouse-utils/type';

import { type FileRouteTypes, routeTree } from '@/routeTree.gen';

export type RouteId = RouteIds<typeof routeTree>;
export type RoutePath = FileRouteTypes['to'];

export type Search<TFrom extends RouteId> = Prettify<
  ExcludeEmptyObject<RouteById<typeof routeTree, TFrom>['types']['fullSearchSchema']>
>;
