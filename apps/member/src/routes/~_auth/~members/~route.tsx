import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useUnmountOverlaysOnRouteChange } from '@yourssu-inhouse/exterior';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
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
