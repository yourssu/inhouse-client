import type { QueryClient } from '@tanstack/react-query';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

interface RouteContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => <Outlet />,
  // Todo: UI 완성하기 + 로그아웃 / 리셋 버튼 등
  errorComponent: ({ error, info }) => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="bg-red100 rounded-2 flex w-[960px] flex-col gap-y-4 p-4">
        <div className="heading-large">{error.name}</div>
        {[error.message, error.stack, info?.componentStack]
          .filter((v) => !!v)
          .map((v) => (
            <div className="body-xsmall-default w-full overflow-auto whitespace-pre-wrap" key={v}>
              {v}
            </div>
          ))}
      </div>
    </div>
  ),
});
