import { usePrefetchQuery } from '@tanstack/react-query';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { semestersNowOption, semestersOption } from '@/apis/semesters/query';
import { PageLayout } from '@/components/PageLayout';
import { getAuthTokens, removeAuthTokens } from '@/utils/auth';

const AuthLayout = () => {
  usePrefetchQuery(meOption());
  usePrefetchQuery(semestersOption());
  usePrefetchQuery(semestersNowOption());
  usePrefetchQuery(partsOption());

  return (
    <PageLayout>
      <Outlet />
    </PageLayout>
  );
};

export const Route = createFileRoute('/_auth')({
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
