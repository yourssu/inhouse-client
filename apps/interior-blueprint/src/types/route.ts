import type { Prettify } from '@inhouse/utils/type';
import type { RouteById, RouteIds } from '@tanstack/react-router';

import { type FileRouteTypes, routeTree } from '@/routeTree.gen';

export type RouteId = RouteIds<typeof routeTree>;
export type RoutePath = FileRouteTypes['to'];

export type Search<TFrom extends RouteId> = Prettify<
  RouteById<typeof routeTree, TFrom>['types']['fullSearchSchema']
>;
