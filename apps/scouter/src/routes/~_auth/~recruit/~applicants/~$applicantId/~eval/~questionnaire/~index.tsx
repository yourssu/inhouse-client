import type { ReactNode } from 'react';

import { QueryErrorResetBoundary, useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button, Result } from '@yourssu-inhouse/interior';
import { Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { trackScouterEvent } from '@/analytics/client';
import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
import {
  interviewEvaluatorStatusesOption,
  myInterviewEvaluationOption,
} from '@/apis/interviews/evaluations/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { InterviewRequirementsParamsSchema } from '@/apis/interviews/requirements/schema';
import { interviewRubricOption } from '@/apis/interviews/rubrics/query';
import { activeMembersOption, meOption } from '@/apis/members/query';
import { Paper } from '@/components/Paper';
import { QuestionnairePanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~questionnaire/components/QuestionnairePanel';
import {
  DocumentReferencePanelSkeleton,
  QuestionnairePageSkeleton,
  QuestionnairePanelSkeleton,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~questionnaire/components/QuestionnaireSkeletons';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/ApplicantPageHeader';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/DocumentReview';

import type { QuestionnaireAnalyticsCommonProperties, TrackQuestionnaireEvent } from './analytics';

import { QuestionnaireAnalyticsContext } from './analytics';

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
  const trackQuestionnaireEvent = useCallback<TrackQuestionnaireEvent>(
    (eventName, properties) => {
      const commonProperties: QuestionnaireAnalyticsCommonProperties = {
        applicant_id: applicant.applicantId,
        applicant_state: applicant.state,
        application_semester: applicant.applicationSemester,
        event_schema_version: 'v1',
        part_id: applicant.partId,
      };

      trackScouterEvent(eventName, { ...commonProperties, ...properties });
    },
    [applicant.applicantId, applicant.applicationSemester, applicant.partId, applicant.state],
  );

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="질문지 설계" />

      <QuestionnaireAnalyticsContext.Provider value={trackQuestionnaireEvent}>
        <main className="flex min-h-0 min-w-0 flex-[1_1_0] gap-4 pt-7">
          <section
            aria-label="지원서 답변과 코멘트"
            className="flex min-h-0 min-w-0 flex-1 flex-col"
          >
            <PanelBoundary
              description="서류 답변과 코멘트를 다시 불러와 주세요."
              fallback={<DocumentReferencePanelSkeleton />}
              title="지원서 정보를 불러오지 못했어요"
            >
              <DocumentReview
                answers={answers}
                applicantId={applicantIdNumber}
                comments={comments}
                onCommentAddClick={() =>
                  trackQuestionnaireEvent('questionnaire_comment_add_click', {})
                }
                onCommentCreated={({ parentCommentId, sectionId }) =>
                  trackQuestionnaireEvent('questionnaire_comment_created', {
                    comment_type: parentCommentId === null ? 'comment' : 'reply',
                    question_id: sectionId,
                  })
                }
              />
            </PanelBoundary>
          </section>

          <aside aria-label="면접 질문지" className="flex min-h-0 w-100 shrink-0 flex-col">
            <PanelBoundary
              description="면접 질문지와 요구조건을 다시 불러와 주세요."
              fallback={<QuestionnairePanelSkeleton />}
              title="질문지를 불러오지 못했어요"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <QuestionnairePanel
                  applicantId={Number(applicantId)}
                  partId={applicant.partId}
                  semester={applicant.applicationSemester}
                />
              </div>
            </PanelBoundary>
          </aside>
        </main>
      </QuestionnaireAnalyticsContext.Provider>
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

export const Route = createFileRoute('/_auth/recruit/applicants/$applicantId/eval/questionnaire/')({
  component: RouteComponent,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps, params }) => {
    const applicantId = Number(params.applicantId);

    context.queryClient.prefetchQuery(applicantDocumentAnswersOption(applicantId));
    context.queryClient.prefetchQuery(applicantDocumentCommentsOption(applicantId));
    context.queryClient.prefetchQuery(applicantByIdOption(applicantId));
    context.queryClient.prefetchQuery(meOption());
    context.queryClient.prefetchQuery(assignedQuestionsOption(applicantId));
    context.queryClient.prefetchQuery(interviewEvaluatorStatusesOption(applicantId));
    context.queryClient.prefetchQuery(myInterviewEvaluationOption(applicantId));

    if (deps.partId !== undefined) {
      context.queryClient.prefetchQuery(activeMembersOption({ partId: deps.partId }));
    }

    if (deps.partId !== undefined && deps.semester !== undefined) {
      context.queryClient.prefetchQuery(
        interviewRequirementsOption({ partId: deps.partId, semester: deps.semester }),
      );
      context.queryClient.prefetchQuery(
        interviewRubricOption({ partId: deps.partId, semester: deps.semester }),
      );
    }
  },
  validateSearch: InterviewRequirementsParamsSchema.partial().catch({}),
});
