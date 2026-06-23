import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';
import { FcConferenceCall } from 'react-icons/fc';

import { PageLayout } from '@/components/PageLayout';

export const Route = createFileRoute('/_auth/members')({
  component: () => {
    return (
      <>
        <PageLayout.TabSection
          items={[
            {
              content: '멤버 관리',
              to: '/members/list',
              icon: <FcConferenceCall />,
            },
          ]}
        />
        <Outlet />
      </>
    );
  },
  beforeLoad: ({ location }) => {
    const href = trimPathRight(location.href);
    if (href === '/members') {
      throw redirect({
        to: '/members/list',
        search: { t: undefined },
      });
    }
  },
});
