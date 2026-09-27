import { PageLayout } from '@exterior/layout';
import { removeAuthTokens } from '@inhouse/auth';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { MdPerson, MdPersonSearch } from 'react-icons/md';

import { ProfileButton } from '@/components/ProfileButton';
import { requireAuth } from '@/guards/requireAuth';

const AuthLayout = () => {
  return (
    <PageLayout
      menu={[
        {
          icon: <MdPerson />,
          label: '멤버',
          to: '/members',
          disabledToast: '아직 준비중인 서비스에요',
        },
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
