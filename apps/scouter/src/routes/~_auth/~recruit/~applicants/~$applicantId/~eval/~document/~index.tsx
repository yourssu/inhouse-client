import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button, Divider, Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { overlay } from 'overlay-kit';
import { Suspense, useCallback } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { trackScouterEvent } from '@/analytics/client';
import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import {
  applicantDocumentCommentsOption,
  documentEvaluatorStatusesOption,
  getApplicantDocumentsEvaluationsOption,
  getPartDocumentsRubricsOption,
} from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { Paper } from '@/components/Paper';
import { EvalForm } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm';
import { OtherDocumentEvaluationsPanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm/OtherDocumentEvaluationsPanel';
import { FinalEvalDialog } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/FinalEvalDialog';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/ApplicantPageHeader';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/DocumentReview';
import { isDocumentEvalActionAllowed } from '@/types/applicants';

import type { DocumentAnalyticsCommonProperties, TrackDocumentEvent } from './analytics';

import { DocumentAnalyticsContext } from './analytics';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();

  const [
    { data: applicant },
    { data: answers },
    { data: comments },
    { data: evaluations },
    { data: parts },
    { data: evaluatorStatuses },
  ] = useSuspenseQueries({
    queries: [
      applicantByIdOption(Number(applicantId)),
      applicantDocumentAnswersOption(Number(applicantId)),
      applicantDocumentCommentsOption(Number(applicantId)),
      getApplicantDocumentsEvaluationsOption(Number(applicantId)),
      partsOption(),
      documentEvaluatorStatusesOption(Number(applicantId)),
    ],
  });

  const part = parts.find((p) => p.partName === applicant.part) ?? parts[0];
  const {
    data: { rubrics },
  } = useSuspenseQuery(getPartDocumentsRubricsOption(part.partId));

  const isScoringComplete = rubrics.reduce((sum, rubric) => sum + rubric.maxScore, 0) === 100;
  const isDocumentEvaluationDisabled = !isDocumentEvalActionAllowed(applicant.state);
  const unsubmittedEvaluatorCount = evaluatorStatuses.filter(
    ({ status }) => status !== 'SUBMITTED',
  ).length;
  const trackDocumentEvent = useCallback<TrackDocumentEvent>(
    (eventName, properties) => {
      const commonProperties: DocumentAnalyticsCommonProperties = {
        applicant_id: applicant.applicantId,
        applicant_state: applicant.state,
        application_semester: applicant.applicationSemester,
        assignment_required: part.hasAssignment,
        event_schema_version: 'v1',
        my_evaluation_status: evaluations.submittedAt == null ? 'not_submitted' : 'submitted',
        part_id: applicant.partId,
      };

      trackScouterEvent(eventName, { ...commonProperties, ...properties });
    },
    [
      applicant.applicantId,
      applicant.applicationSemester,
      applicant.partId,
      applicant.state,
      evaluations.submittedAt,
      part.hasAssignment,
    ],
  );

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="서류 평가" />

      <DocumentAnalyticsContext.Provider value={trackDocumentEvent}>
        <main className="flex min-h-0 flex-[1_1_0] gap-4 pt-7">
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
            <DocumentReview
              answers={answers}
              applicantId={applicant.applicantId}
              comments={comments}
              onCommentAddClick={() => trackDocumentEvent('document_comment_add_click', {})}
              onCommentCreated={({ parentCommentId, sectionId }) =>
                trackDocumentEvent('document_comment_created', {
                  comment_type: parentCommentId === null ? 'comment' : 'reply',
                  question_id: sectionId,
                })
              }
            />
            <Paper className="relative min-h-0 w-100 overflow-hidden p-4">
              <div className="flex min-h-0 w-full flex-col overflow-y-auto">
                <EvalForm />
                {isScoringComplete && (
                  <>
                    <Divider className="my-6" />
                    <div className="flex flex-col gap-5">
                      <OtherDocumentEvaluationsPanel
                        applicantId={applicant.applicantId}
                        documentAverageScore={applicant.documentAverageScore}
                      />
                      <Divider />
                      <Button
                        disabled={evaluations.items.length === 0 || isDocumentEvaluationDisabled}
                        onClick={() => {
                          trackDocumentEvent('document_final_decision_click', {
                            unsubmitted_evaluator_count: unsubmittedEvaluatorCount,
                          });
                          overlay.open(({ isOpen, close }) => {
                            return (
                              <FinalEvalDialog
                                applicantId={applicant.applicantId}
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
                  </>
                )}
              </div>
            </Paper>
          </ErrorBoundary>
        </main>
      </DocumentAnalyticsContext.Provider>
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
    context.queryClient.prefetchQuery(documentEvaluatorStatusesOption(applicantId));
    context.queryClient.prefetchQuery(meOption());
  },
});
