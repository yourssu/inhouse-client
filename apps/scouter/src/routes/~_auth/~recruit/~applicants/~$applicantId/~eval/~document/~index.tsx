import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button, Divider, Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { overlay } from 'overlay-kit';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import {
  applicantDocumentCommentsOption,
  getApplicantDocumentsEvaluationsOption,
} from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { Paper } from '@/components/Paper';
import { EvalForm } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm';
import { OtherDocumentEvaluationsPanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm/OtherDocumentEvaluationsPanel';
import { FinalEvalDialog } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/FinalEvalDialog';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/DocumentReview';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();

  const [{ data: applicant }, { data: answers }, { data: comments }, { data: evaluations }] =
    useSuspenseQueries({
      queries: [
        applicantByIdOption(Number(applicantId)),
        applicantDocumentAnswersOption(Number(applicantId)),
        applicantDocumentCommentsOption(Number(applicantId)),
        getApplicantDocumentsEvaluationsOption(Number(applicantId)),
      ],
    });

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="서류 평가" />

      <main className="flex flex-[1_1_0] gap-4 pt-7">
        <ErrorBoundary
          fallback={
            <Paper className="flex size-full items-center justify-center">
              <Result
                description="지원자가 제출한 서류 응답이 아직 연동되지 않았어요."
                figure={<Lottie className="size-10" delay={0.2} json={lotties.empty} />}
                title="연동된 서류 응답이 없어요"
              />
            </Paper>
          }
        >
          <DocumentReview answers={answers} applicantId={Number(applicantId)} comments={comments} />
          <Paper className="relative w-100 p-4">
            <div className="w-full">
              <EvalForm />
              <Divider className="my-6" />
              <div className="flex flex-col gap-5">
                <OtherDocumentEvaluationsPanel
                  applicantId={Number(applicantId)}
                  documentAverageScore={applicant.documentAverageScore}
                />
                <Divider />
                <Button
                  disabled={evaluations.items.length === 0}
                  onClick={() => {
                    overlay.open(({ isOpen, close }) => {
                      return (
                        <FinalEvalDialog
                          applicantId={Number(applicantId)}
                          close={close}
                          isOpen={isOpen}
                        />
                      );
                    });
                  }}
                  size="lg"
                >
                  최종 서류 평가
                </Button>
              </div>
            </div>
          </Paper>
        </ErrorBoundary>
      </main>
    </PageLayout.Content>
  );
};

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval/document/')({
  component: () => (
    <Suspense>
      <RouteComponent />
    </Suspense>
  ),
  loader: ({ context, params }) => {
    const applicantId = Number(params.applicantId);

    context.queryClient.prefetchQuery(applicantByIdOption(applicantId));
    context.queryClient.prefetchQuery(applicantDocumentAnswersOption(applicantId));
    context.queryClient.prefetchQuery(applicantDocumentCommentsOption(applicantId));
    context.queryClient.prefetchQuery(meOption());
  },
});
