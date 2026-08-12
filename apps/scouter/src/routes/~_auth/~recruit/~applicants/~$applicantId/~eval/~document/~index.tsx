import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { Lottie } from '@toss/lottie';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Button, Divider, Result } from '@yourssu-inhouse/interior';
import { lotties } from '@yourssu-inhouse/resources';
import { overlay } from 'overlay-kit';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { SwitchCase } from 'react-simplikit';
import { z } from 'zod/v4';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import {
  applicantDocumentCommentsOption,
  getPartDocumentsDeadlineOption,
} from '@/apis/documents/query';
import { meOption } from '@/apis/members/query';
import { Paper } from '@/components/Paper';
import { EvalForm } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/EvalForm';
import { FinalEvalDialog } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/FinalEvalDialog';
import { QuestionSetting } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~document/components/QuestionSetting';
import { Thread } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/Thread';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/DocumentReview';

import { CommentField } from '../components/CommentField';

const RouteComponent = () => {
  const { applicantId } = Route.useParams();
  const { partId } = Route.useSearch();

  const [{ data: applicant }, { data: answers }, { data: comments }, { data: deadline }] =
    useSuspenseQueries({
      queries: [
        applicantByIdOption(Number(applicantId)),
        applicantDocumentAnswersOption(Number(applicantId)),
        applicantDocumentCommentsOption(Number(applicantId)),
        getPartDocumentsDeadlineOption(partId),
      ],
    });

  const [sidebarView, setSidebarView] = useState<'문항 설정' | '서류 평가'>('서류 평가');
  const [openCommentSectionId, setOpenCommentSectionId] = useState<null | number>(null);

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} deadline={deadline.deadline} label="서류 평가" />

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
          <DocumentReview
            answers={answers}
            comments={comments}
            onAddComment={setOpenCommentSectionId}
            renderBeforeThreads={(sectionId) =>
              openCommentSectionId === sectionId && (
                <CommentField
                  applicantId={Number(applicantId)}
                  onClose={() => setOpenCommentSectionId(null)}
                  parentCommentId={null}
                  sectionId={sectionId}
                />
              )
            }
            renderThread={({ isSelected, thread }) => (
              <Thread
                applicantId={Number(applicantId)}
                isSelected={isSelected}
                key={thread[0].commentId}
                thread={thread}
              />
            )}
          />
          <Paper className="relative w-100">
            <SwitchCase
              caseBy={{
                '서류 평가': () => (
                  <div className="w-full">
                    <EvalForm />
                    <Divider className="my-6" />
                    <div className="flex flex-col">
                      {/* TODO: 지원자 조회 정상화 이후 버튼 위에 해당 지원자의 서류 평가 점수 평균과 최종 합불 여부를 출력해야 함 */}
                      <Button
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
                        최종 서류 평가 제출하기
                      </Button>
                    </div>

                    <Button
                      className="absolute top-4 right-4"
                      onClick={() => setSidebarView('문항 설정')}
                      size="sm"
                    >
                      문항 설정
                    </Button>
                  </div>
                ),
                '문항 설정': () => <QuestionSetting onClose={() => setSidebarView('서류 평가')} />,
              }}
              value={sidebarView}
            />
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
  validateSearch: z.object({
    partId: z.number(),
  }),
  loaderDeps: ({ search }) => ({ partId: search.partId }),
  loader: ({ context, params, deps }) => {
    const applicantId = Number(params.applicantId);

    context.queryClient.prefetchQuery(getPartDocumentsDeadlineOption(deps.partId));
    context.queryClient.prefetchQuery(applicantByIdOption(applicantId));
    context.queryClient.prefetchQuery(applicantDocumentAnswersOption(applicantId));
    context.queryClient.prefetchQuery(applicantDocumentCommentsOption(applicantId));
    context.queryClient.prefetchQuery(meOption());
  },
});
