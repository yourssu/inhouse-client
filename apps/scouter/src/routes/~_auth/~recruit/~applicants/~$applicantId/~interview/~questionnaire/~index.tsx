import type { ReactNode } from 'react';

import { QueryErrorResetBoundary, useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button, Result } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { InterviewRequirementsParamsSchema } from '@/apis/interviews/requirements/schema';
import { activeMembersOption, meOption } from '@/apis/members/query';
import { Paper } from '@/components/Paper';
import { QuestionnairePanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnairePanel';
import {
  DocumentReferencePanelSkeleton,
  QuestionnairePageSkeleton,
  QuestionnairePanelSkeleton,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnaireSkeletons';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/DocumentReview';

const QuestionnairePage = () => {
  const { applicantId } = Route.useParams();
  const applicantIdNumber = Number(applicantId);
  const [{ data: applicant }, { data: answers }, { data: comments }] = useSuspenseQueries({
    queries: [
      applicantByIdOption(applicantIdNumber),
      applicantDocumentAnswersOption(applicantIdNumber),
      applicantDocumentCommentsOption(applicantIdNumber),
    ],
  });

  return (
    <PageLayout.Content className="self-start py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="질문지 설계" />

      <main className="flex min-w-0 gap-4 pt-7">
        <section aria-label="지원서 답변과 코멘트" className="min-w-0 flex-1">
          <PanelBoundary
            description="서류 답변과 코멘트를 다시 불러와 주세요."
            fallback={<DocumentReferencePanelSkeleton />}
            title="지원서 정보를 불러오지 못했어요"
          >
            <DocumentReview answers={answers} applicantId={applicantIdNumber} comments={comments} />
          </PanelBoundary>
        </section>

        <aside aria-label="면접 질문지" className="sticky top-3 h-fit w-100 shrink-0">
          <PanelBoundary
            description="면접 질문지와 요구조건을 다시 불러와 주세요."
            fallback={<QuestionnairePanelSkeleton />}
            title="질문지를 불러오지 못했어요"
          >
            <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto">
              <QuestionnairePanel
                applicantId={Number(applicantId)}
                partId={applicant.partId}
                semester={applicant.applicationSemester}
              />
            </div>
          </PanelBoundary>
        </aside>
      </main>
    </PageLayout.Content>
  );
};

interface PanelBoundaryProps {
  children: ReactNode;
  description: string;
  fallback: ReactNode;
  title: string;
}

const PanelBoundary = ({ children, description, fallback, title }: PanelBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <PanelError
              description={description}
              onRetry={() => resetErrorBoundary()}
              title={title}
            />
          )}
          onReset={reset}
        >
          <Suspense fallback={fallback}>{children}</Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

interface PanelErrorProps {
  description: string;
  onRetry: () => void;
  title: string;
}

const PanelError = ({ description, onRetry, title }: PanelErrorProps) => {
  return (
    <Paper className="min-h-96 w-full flex-col items-center justify-center gap-4 text-center">
      <Result description={description} title={title} />
      <Button onClick={onRetry} size="sm" variant="secondary">
        다시 시도
      </Button>
    </Paper>
  );
};

const PageError = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <Paper className="min-h-96 flex-col items-center justify-center gap-4 text-center">
        <Result description="잠시 후 다시 시도해 주세요." title="문제가 발생했어요" />
        <Button onClick={onRetry} size="sm" variant="secondary">
          다시 시도
        </Button>
      </Paper>
    </PageLayout.Content>
  );
};

const RouteComponent = () => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          fallbackRender={({ resetErrorBoundary }) => (
            <PageError onRetry={() => resetErrorBoundary()} />
          )}
          onReset={reset}
        >
          <Suspense fallback={<QuestionnairePageSkeleton />}>
            <QuestionnairePage />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

export const Route = createFileRoute(
  '/_auth/recruit/applicants/$applicantId/interview/questionnaire/',
)({
  component: RouteComponent,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps, params }) => {
    const applicantId = Number(params.applicantId);

    context.queryClient.prefetchQuery(applicantDocumentAnswersOption(applicantId));
    context.queryClient.prefetchQuery(applicantDocumentCommentsOption(applicantId));
    context.queryClient.prefetchQuery(applicantByIdOption(applicantId));
    context.queryClient.prefetchQuery(meOption());
    context.queryClient.prefetchQuery(assignedQuestionsOption(applicantId));

    if (deps.partId !== undefined) {
      context.queryClient.prefetchQuery(activeMembersOption({ partId: deps.partId }));
    }

    if (deps.partId !== undefined && deps.semester !== undefined) {
      context.queryClient.prefetchQuery(
        interviewRequirementsOption({ partId: deps.partId, semester: deps.semester }),
      );
    }
  },
  validateSearch: InterviewRequirementsParamsSchema.partial().catch({}),
});
