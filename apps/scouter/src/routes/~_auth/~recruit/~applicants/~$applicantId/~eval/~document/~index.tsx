import { createFileRoute } from '@tanstack/react-router';

const RouteComponent = () => {
  return null;
};

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval/document/')({
  component: RouteComponent,
});
