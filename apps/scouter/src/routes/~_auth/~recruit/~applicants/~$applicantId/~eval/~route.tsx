import { createFileRoute, Outlet } from '@tanstack/react-router';

const RouteComponent = () => {
  return <Outlet />;
};

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval')({
  component: RouteComponent,
});
