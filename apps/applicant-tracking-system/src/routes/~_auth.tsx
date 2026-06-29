import { usePrefetchQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@yourssu-inhouse/auth';
import { PageLayout } from '@yourssu-inhouse/exterior';
import { Suspense } from 'react';
import { MdPerson, MdPersonSearch } from 'react-icons/md';

import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { semestersNowOption, semestersOption } from '@/apis/semesters/query';
import { ProfileButton } from '@/components/ProfileButton';

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
  beforeLoad: requireAuth(),
});
