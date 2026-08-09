import type { ReactNode } from 'react';

import { QueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Badge, Button, Result } from '@yourssu-inhouse/interior';
import { cn } from '@yourssu-inhouse/interior-tailwind/utils';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MdPerson } from 'react-icons/md';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { InterviewRequirementsParamsSchema } from '@/apis/interviews/requirements/schema';
import { activeMembersOption } from '@/apis/members/query';
import { semestersNowOption } from '@/apis/semesters/query';
import { Paper } from '@/components/Paper';
import { DocumentReferencePanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/DocumentReferencePanel';
import { QuestionnairePanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnairePanel';
import { applicantStateKo } from '@/types/applicants';
import { partNameKo } from '@/types/parts';
import { formatSemester } from '@/utils/semester';

const QuestionnairePage = () => {
  const { applicantId } = Route.useParams();
  const { data: applicant } = useSuspenseQuery(applicantByIdOption(Number(applicantId)));

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
            fallback={<DocumentPanelSkeleton />}
            title="지원서 정보를 불러오지 못했어요"
          >
            <DocumentReferencePanel applicantId={Number(applicantId)} />
          </PanelBoundary>
        </section>

        <aside aria-label="면접 질문지" className="sticky top-3 h-fit w-112 shrink-0">
          <PanelBoundary
            description="면접 질문지와 요구조건을 다시 불러와 주세요."
            fallback={<QuestionnairePanelSkeleton />}
            title="질문지를 불러오지 못했어요"
          >
            <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto">
              <QuestionnairePanel applicantId={Number(applicantId)} partId={applicant.partId} />
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

const DocumentPanelSkeleton = () => {
  return (
    <Paper
      aria-busy="true"
      aria-label="지원서와 코멘트 불러오는 중"
      className="min-h-150 min-w-0 flex-1 gap-4"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {Array.from({ length: 4 }, (_, index) => (
          <DocumentAnswerSkeleton key={index} />
        ))}
      </div>

      <div className="relative w-68 shrink-0">
        <div className="sticky top-3 flex flex-col gap-5">
          {Array.from({ length: 4 }, (_, index) => (
            <CommentThreadSkeleton key={index} />
          ))}
        </div>
      </div>
    </Paper>
  );
};

const DocumentAnswerSkeleton = () => {
  return (
    <div className="flex h-fit w-full flex-col gap-3 p-5">
      <div className="flex items-start gap-2">
        <SkeletonBlock className="rounded-6 size-7 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-1">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-3/5" />
        </div>
      </div>

      <div className="flex flex-col gap-2 pl-9">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>
    </div>
  );
};

const CommentThreadSkeleton = () => {
  return (
    <div className="border-greyOpacity200 rounded-8 flex flex-col gap-3 border p-4">
      <div className="flex items-center gap-1">
        <SkeletonBlock className="h-3.5 w-24" />
        <SkeletonBlock className="h-3 w-10" />
      </div>
      <div className="flex flex-col gap-2 pl-1">
        <SkeletonBlock className="h-3.5 w-full" />
        <SkeletonBlock className="h-3.5 w-4/5" />
      </div>
    </div>
  );
};

const QuestionnairePanelSkeleton = () => {
  return (
    <Paper
      aria-busy="true"
      aria-label="질문지 불러오는 중"
      className="max-h-[calc(100vh-1.5rem)] min-h-150 w-full flex-col gap-6 overflow-hidden p-5"
    >
      <header className="flex items-center justify-between gap-3">
        <SkeletonBlock className="h-7 w-28" />
        <SkeletonBlock className="h-6 w-10 rounded-full" />
      </header>

      <div className="flex flex-col gap-4">
        <QuestionnaireSectionHeaderSkeleton />

        <div className="flex flex-col gap-2">
          <QuestionnaireSectionHeaderSkeleton hasDescription />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <QuestionCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </Paper>
  );
};

interface QuestionnaireSectionHeaderSkeletonProps {
  hasDescription?: boolean;
}

const QuestionnaireSectionHeaderSkeleton = ({
  hasDescription = false,
}: QuestionnaireSectionHeaderSkeletonProps) => {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <SkeletonBlock className="h-5 w-16" />
          <SkeletonBlock className="h-5 w-9 rounded-full" />
        </div>
        {hasDescription && <SkeletonBlock className="mt-1.5 h-3 w-56" />}
      </div>
      <SkeletonBlock className="size-5 shrink-0" />
    </div>
  );
};

const QuestionCardSkeleton = () => {
  return (
    <div className="border-greyOpacity200 rounded-10 flex flex-col gap-2 border px-4 py-3">
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-3/4" />
      </div>
      <div className="flex flex-col gap-1.5">
        <SkeletonBlock className="h-3 w-10" />
        <SkeletonBlock className="h-8 w-full" />
      </div>
    </div>
  );
};

const PageSkeleton = () => {
  return (
    <PageLayout.Content className="self-start py-7!" maxWidth="full">
      <div aria-busy="true" aria-label="질문지 설계 화면 불러오는 중">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <SkeletonBlock className="size-12 shrink-0 rounded-lg" />
            <div className="flex min-w-0 flex-col gap-2">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-7 w-36" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            {infoItemSkeletons.map(({ key, labelClassName, valueClassName }) => (
              <InfoItemSkeleton
                key={key}
                labelClassName={labelClassName}
                valueClassName={valueClassName}
              />
            ))}
          </div>
        </header>

        <main className="flex min-w-0 gap-4 pt-7">
          <section className="min-w-0 flex-1">
            <DocumentPanelSkeleton />
          </section>
          <aside className="sticky top-3 h-fit w-112 shrink-0">
            <QuestionnairePanelSkeleton />
          </aside>
        </main>
      </div>
    </PageLayout.Content>
  );
};

interface InfoItemSkeletonProps {
  labelClassName: string;
  valueClassName: string;
}

const InfoItemSkeleton = ({ labelClassName, valueClassName }: InfoItemSkeletonProps) => {
  return (
    <div className="border-greyOpacity200 flex items-center gap-2.5 not-first-of-type:border-l not-first-of-type:pl-3">
      <SkeletonBlock className={cn('h-3.5', labelClassName)} />
      <SkeletonBlock className={cn('h-4', valueClassName)} />
    </div>
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

const SkeletonBlock = ({ className }: { className: string }) => {
  return (
    <div
      aria-hidden
      className={cn(
        'bg-greyOpacity100 rounded-8 animate-pulse motion-reduce:animate-none',
        className,
      )}
    />
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

const infoItemSkeletons = [
  { key: 'part', labelClassName: 'w-10', valueClassName: 'w-14' },
  { key: 'state', labelClassName: 'w-12', valueClassName: 'w-14' },
  { key: 'studentId', labelClassName: 'w-6', valueClassName: 'w-16' },
  { key: 'department', labelClassName: 'w-6', valueClassName: 'w-20' },
  { key: 'semester', labelClassName: 'w-12', valueClassName: 'w-16' },
  { key: 'age', labelClassName: 'w-6', valueClassName: 'w-8' },
  { key: 'applicationDate', labelClassName: 'w-10', valueClassName: 'w-20' },
];

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
          <Suspense fallback={<PageSkeleton />}>
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
