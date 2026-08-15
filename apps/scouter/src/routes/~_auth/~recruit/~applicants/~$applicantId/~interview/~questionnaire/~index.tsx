import type { ReactNode } from 'react';

import { QueryErrorResetBoundary, useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Badge, Button, Result } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdPerson } from 'react-icons/md';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { InterviewRequirementsParamsSchema } from '@/apis/interviews/requirements/schema';
import { activeMembersOption, meOption } from '@/apis/members/query';
import { semestersNowOption } from '@/apis/semesters/query';
import { Paper } from '@/components/Paper';
import { QuestionnairePanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnairePanel';
import {
  DocumentReferencePanelSkeleton,
  QuestionnairePageSkeleton,
  QuestionnairePanelSkeleton,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnaireSkeletons';
import { DocumentReview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/DocumentReview';
import { applicantStateKo } from '@/types/applicants';
import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

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
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="bg-grey200 flex size-12 shrink-0 items-center justify-center rounded-lg">
            <MdPerson aria-hidden className="size-7" />
          </div>
          <div className="min-w-0">
            <div className="text-violet600 text-sm font-medium">질문지 설계</div>
            <h1 className="truncate text-xl font-semibold">{applicant.name} 지원자</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3">
          <InfoItem label="지원 파트">{partNameKo[applicant.part]}</InfoItem>
          <InfoItem label="심사 상태">
            <Badge color="violet" size="sm">
              {applicantStateKo[applicant.state]}
            </Badge>
          </InfoItem>
          <InfoItem label="학번">{applicant.studentId}</InfoItem>
          <InfoItem label="학과">{applicant.department}</InfoItem>
          <InfoItem label="현재 학기">{formatSemester(applicant.academicSemester)}</InfoItem>
          <InfoItem label="나이">{applicant.age}세</InfoItem>
          <InfoItem label="지원일">
            {formatTemplates['2026-01-01'](applicant.applicationDate)}
          </InfoItem>
        </div>
      </header>

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

        <aside aria-label="면접 질문지" className="sticky top-3 h-fit w-112 shrink-0">
          <PanelBoundary
            description="면접 질문지와 요구조건을 다시 불러와 주세요."
            fallback={<QuestionnairePanelSkeleton />}
            title="질문지를 불러오지 못했어요"
          >
            <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto">
              <QuestionnairePanel applicantId={applicantIdNumber} partId={applicant.partId} />
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

const InfoItem = ({ label, children }: React.PropsWithChildren<{ label: string }>) => {
  return (
    <div className="text-13 border-greyOpacity200 flex items-center gap-2.5 not-first-of-type:border-l not-first-of-type:pl-3">
      <div className="text-neutralSubtle">{label}</div>
      <div className="text-neutralMuted font-medium">{children}</div>
    </div>
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
    context.queryClient.prefetchQuery(semestersNowOption());

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
