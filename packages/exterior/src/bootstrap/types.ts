import type { QueryClient } from '@tanstack/react-query';
import type { AnyRoute } from '@tanstack/react-router';

/**
  exterior/mfa-shell 이 다루는 routeTree 의 최소 계약. concrete routeTree 타입을
  그대로 쓰는 쪽(mfa-shell 의 createRemotePreviewApp 제네릭 등)에서 typed router 가
  보존되도록, routeTree 자체는 베이스 타입으로만 제약해요.
*/
export type AppRouteTree = AnyRoute & {
  types: {
    routerContext: RouteContext;
  };
};

export interface RouteContext {
  queryClient: QueryClient;
}
