import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Suspense } from 'react';
import { SwitchCase } from 'react-simplikit';

import { applicantByIdOption } from '@/apis/applicants/query';
import { Paper } from '@/components/Paper';
import { InterviewTab } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';

const INTERVIEW_TABS: readonly string[] = ['질문', '지원서'];

const RouteComponent = () => {
  const { applicantId } = Route.useParams();
  const { data: applicant } = useSuspenseQuery(applicantByIdOption(Number(applicantId)));

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="면접 평가" />

      <main className="flex flex-[1_1_0] items-start gap-4 pt-7">
        <InterviewTab className="w-fit" tabs={INTERVIEW_TABS}>
          {({ tab }) => (
            <Paper className="h-full w-90 flex-1 p-4">
              <SwitchCase
                caseBy={{
                  질문: () => <div>질문 콘텐츠 준비 중</div>,
                  지원서: () => <div>지원서 콘텐츠 준비 중</div>,
                }}
                value={tab}
              />
            </Paper>
          )}
        </InterviewTab>
        <Paper className="h-full flex-1 flex-col gap-4">내부 패널</Paper>
        <Paper className="w-100 shrink-0">사이드바</Paper>
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
  },
});
