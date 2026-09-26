import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { removeAuthTokens } from '@yourssu-inhouse/auth';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { MdPerson, MdPersonSearch } from 'react-icons/md';

import { ProfileButton } from '@/components/ProfileButton';
import { requireAuth } from '@/guards/requireAuth';

const AuthLayout = () => {
  return (
    <PageLayout
      menu={[
        { icon: <MdPerson />, label: '멤버', to: '/members' },
        { icon: <MdPersonSearch />, label: '스카우터', to: '/recruit' },
      ]}
      profile={<ProfileButton />}
    >
      <Outlet />
    </PageLayout>
  );
};

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const isAuthenticated = await requireAuth();
    if (!isAuthenticated) {
      removeAuthTokens();
      throw redirect({ to: '/signin' });
    }
  },
  component: AuthLayout,
});
