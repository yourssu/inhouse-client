import { createFileRoute, Outlet } from '@tanstack/react-router';
import { requireAuth } from '@yourssu-inhouse/auth';
import { PageLayout } from '@yourssu-inhouse/exterior';

import { ProfileButton } from '@/components/ProfileButton';

const AuthLayout = () => {
  return (
    <PageLayout menu={[]} profile={<ProfileButton />}>
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
