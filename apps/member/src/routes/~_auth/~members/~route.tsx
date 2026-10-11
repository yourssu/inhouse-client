import { PageLayout } from '@exterior/layout';
import { useUnmountOverlaysOnRouteChange } from '@exterior/utils';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { overlay, OverlayProvider } from 'overlay-kit';
import { FcConferenceCall } from 'react-icons/fc';

import { AdaptiveLogo } from '@/components/AdaptiveLogo';

const RouteComponent = () => {
  useUnmountOverlaysOnRouteChange(overlay.unmountAll);

  return (
    <OverlayProvider>
      <PageLayout.TabSection
        items={[
          {
            content: '멤버 관리',
            to: '/members/list',
            icon: <FcConferenceCall />,
          },
        ]}
        logo={<AdaptiveLogo className="h-5" />}
      />
      <Outlet />
    </OverlayProvider>
  );
};

export const Route = createFileRoute('/_auth/members')({
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
  component: RouteComponent,
  head: () => ({
    meta: [{ title: '유어슈 인하우스 | 멤버' }],
  }),
  // beforeLoad: ({ location }) => {
  //   const href = trimPathRight(location.href);
  //   if (href === '/members') {
  //     throw redirect({
  //       to: '/members/list',
  //     });
  //   },
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
});
