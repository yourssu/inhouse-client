import { createFileRoute, Outlet } from '@tanstack/react-router';

import { membersQueries } from '@/apis/members/query';
import { PageLayout } from '@/components/PageLayout';

const AuthLayout = () => {
  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(membersQueries.parts()),
      context.queryClient.ensureQueryData(membersQueries.semesters()),
      context.queryClient.ensureQueryData(membersQueries.currentSemester()),
    ]);
  },
});
