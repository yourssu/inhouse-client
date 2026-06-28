import { createFileRoute, Outlet, redirect, trimPathRight } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/members')({
  component: () => <Outlet />,
  beforeLoad: ({ location }) => {
    const href = trimPathRight(location.href);
    if (href === '/members') {
      throw redirect({
        to: '/members/list',
      });
    }
  },
});
