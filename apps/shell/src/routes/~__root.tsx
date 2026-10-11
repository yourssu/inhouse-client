import { AuthProvider } from '@inhouse/auth';
import { queryClient } from '@inhouse/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRootRoute, HeadContent, Outlet } from '@tanstack/react-router';

import { authClient } from '@/apis/authClient';
import { authConfig } from '@/config';

export const Route = createRootRoute({
  head: () => ({
    meta: [{ title: '유어슈 인하우스' }],
  }),
  component: () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider client={authClient} config={authConfig}>
        <HeadContent />
        <Outlet />
      </AuthProvider>
    </QueryClientProvider>
  ),
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
