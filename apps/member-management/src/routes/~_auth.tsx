import { createFileRoute, Outlet } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior';
import { FcConferenceCall } from 'react-icons/fc';
import { MdPerson } from 'react-icons/md';

import { membersQueries } from '@/apis/members/query';
import { ProfileButton } from '@/components/ProfileButton';

const AuthLayout = () => {
  return (
    <PageLayout menu={[{ icon: <MdPerson />, label: '멤버', to: '/members' }]} profile={<ProfileButton />}>
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
    </PageLayout>
  );
};

export const Route = createFileRoute('/_auth')({
  staticData: {
    shellOptions: {
      collapsible: true,
    },
  },
  component: AuthLayout,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(membersQueries.parts()),
      context.queryClient.ensureQueryData(membersQueries.semesters()),
      context.queryClient.ensureQueryData(membersQueries.currentSemester()),
    ]);
  },
});
