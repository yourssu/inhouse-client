import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { FcConferenceCall } from 'react-icons/fc';

import { AdaptiveLogo } from '@/components/AdaptiveLogo';

export const Route = createFileRoute('/_auth/members')({
  component: () => (
    <>
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
    </>
  ),
  head: () => ({
    meta: [{ title: '유어슈 인하우스 | 멤버' }],
  }),
  beforeLoad: ({ location }) => {
    const href = trimPathRight(location.href);
    if (href === '/members') {
      throw redirect({
        to: '/members/list',
      });
    }
  },
});
