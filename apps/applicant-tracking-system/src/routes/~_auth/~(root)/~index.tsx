import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/(root)/')({
  beforeLoad: () => {
    throw redirect({ to: '/members' });
  },
});
