import type { RouteContext } from '@yourssu-inhouse/exterior';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';

/*
  scouter remote 의 root 라우트예요.
  shell(host)가 단일 라우터/인증/크롬을 소유하므로, remote root 는 RouteContext 타입만 제공하고
  AuthProvider 없이 Outlet 만 렌더해요. runtime context.queryClient 는 shell 의 QueryClient 가 돼요.
  standalone dev preview 에선 errorComponent 만 의미 있어요.
*/
export const Route = createRootRouteWithContext<RouteContext>()({
  component: () => <Outlet />,
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
