import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';

const RouteComponent = () => {
  return <PageLayout.Content title="질문지 설계" />;
};

export const Route = createFileRoute(
  '/_auth/recruit/applicants/$applicantId/interview/questionnaire/',
)({
  component: RouteComponent,
});
