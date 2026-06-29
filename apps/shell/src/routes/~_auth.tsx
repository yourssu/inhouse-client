import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@yourssu-inhouse/auth';
import { PageLayout } from '@yourssu-inhouse/exterior';
import { MdPerson, MdPersonSearch } from 'react-icons/md';

import { ProfileButton } from '@/components/ProfileButton';

const AuthLayout = () => {
  return (
    <PageLayout
      menu={[
        { icon: <MdPerson />, label: '멤버', to: '/members' },
        { icon: <MdPersonSearch />, label: '리쿠르팅', to: '/recruit' },
      ]}
      profile={<ProfileButton />}
    >
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
  beforeLoad: requireAuth(),
  component: AuthLayout,
});
