import { usePrefetchQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior';
import { Suspense } from 'react';
import { MdPerson, MdPersonSearch } from 'react-icons/md';

import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { semestersNowOption, semestersOption } from '@/apis/semesters/query';
import { ProfileButton } from '@/components/ProfileButton';
import { getAuthTokens, removeAuthTokens } from '@/utils/auth';

const AuthLayout = () => {
  usePrefetchQuery(meOption());
  usePrefetchQuery(semestersOption());
  usePrefetchQuery(semestersNowOption());
  usePrefetchQuery(partsOption());

  return (
    <PageLayout
      menu={[
        { icon: <MdPerson />, label: '멤버', to: '/members' },
        { icon: <MdPersonSearch />, label: '리쿠르팅', to: '/recruit' },
      ]}
      profile={
        <Suspense>
          <ProfileButton />
        </Suspense>
      }
    >
      <Outlet />
    </PageLayout>
  );
};

export const Route = createFileRoute('/_auth')({
  staticData: {
    shellOptions: {
      collapsible: false,
    },
  },
  component: AuthLayout,
  beforeLoad: async () => {
    if (getAuthTokens()) {
      return;
    }
    // if ((await validateToken().catch(() => ({ validated: false }))).validated) {
    //   return;
    // }
    removeAuthTokens();
    throw redirect({ to: '/signin' });
  },
});
