import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { Suspense } from 'react';

import { applicantByIdOption } from '@/apis/applicants/query';
import { myInterviewEvaluationOption } from '@/apis/interviews/evaluations/query';
import { Paper } from '@/components/Paper';
import { OtherInterviewEvaluationsPanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/OtherInterviewEvaluationsPanel';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();
  const { data: applicant } = useSuspenseQuery(applicantByIdOption(Number(applicantId)));

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="면접 평가" />

      <main className="flex min-w-0 flex-[1_1_0] gap-4 pt-7">
        <Paper className="h-full min-w-0 flex-1 items-center justify-center">
          <Result
            description="면접 평가 기능은 아직 준비 중이에요."
            figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
            title="면접 평가 준비 중이에요"
          />
        </Paper>
        <Paper className="sticky top-3 h-fit w-100 shrink-0">
          <aside aria-label="다른 평가자 평가" className="w-full">
            <OtherInterviewEvaluationsPanel
              applicantId={Number(applicantId)}
              applicantName={applicant.name}
              applicantState={applicant.state}
              interviewAverageScore={applicant.interviewAverageScore}
            />
          </aside>
        </Paper>
      </main>
    </PageLayout.Content>
  );
};

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval/interview/')({
  component: () => (
    <Suspense>
      <RouteComponent />
    </Suspense>
  ),
  loader: ({ context, params }) => {
    const applicantId = Number(params.applicantId);

    context.queryClient.prefetchQuery(applicantByIdOption(applicantId));
    context.queryClient.prefetchQuery(myInterviewEvaluationOption(applicantId));
  },
});
