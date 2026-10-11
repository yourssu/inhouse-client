import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Global } from '@/Global';

export const Route = createFileRoute('/_auth')({
  component: () => (
    <>
      <Global />
      <Outlet />
    </>
  ),
});
