import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Suspense } from 'react';
import { SwitchCase } from 'react-simplikit';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { myInterviewEvaluationOption } from '@/apis/interviews/evaluations/query';
import { Paper } from '@/components/Paper';
import { InterviewTab } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab';
import { DocumentAnswerForInterview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/DocumentAnswerForInterview';
import { OtherInterviewEvaluationsPanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/OtherInterviewEvaluationsPanel';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';

const INTERVIEW_TABS = ['질문', '지원서'] as const;

const RouteComponent = () => {
  const { applicantId } = Route.useParams();
  const { data: applicant } = useSuspenseQuery(applicantByIdOption(Number(applicantId)));

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="면접 평가" />

      <main className="flex min-w-0 flex-[1_1_0] gap-4 pt-7">
        <InterviewTab className="w-fit" tabs={INTERVIEW_TABS}>
          {({ tab }) => (
            <Paper className="h-full w-90 flex-1 p-4">
              <SwitchCase
                caseBy={{
                  질문: () => <div>질문 콘텐츠 준비 중</div>,
                  지원서: () => <DocumentAnswerForInterview applicantId={Number(applicantId)} />,
                }}
                value={tab}
              />
            </Paper>
          )}
        </InterviewTab>
        <Paper className="h-full flex-1 flex-col gap-4">내부 패널</Paper>
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
    context.queryClient.prefetchQuery(applicantDocumentAnswersOption(applicantId));
  },
});
