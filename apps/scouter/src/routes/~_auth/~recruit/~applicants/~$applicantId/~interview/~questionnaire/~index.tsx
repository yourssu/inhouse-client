import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { formatTemplates } from '@yourssu-inhouse/inhouse-utils/date';
import { Badge } from '@yourssu-inhouse/interior';
import { Suspense } from 'react';
import { MdPerson } from 'react-icons/md';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { applicantDocumentCommentsOption } from '@/apis/documents/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { InterviewRequirementsParamsSchema } from '@/apis/interviews/requirements/schema';
import { activeMembersOption } from '@/apis/members/query';
import { semestersNowOption } from '@/apis/semesters/query';
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
          <DocumentReferencePanel applicantId={Number(applicantId)} />
        </section>

        <aside aria-label="면접 질문지" className="sticky top-3 h-fit w-112 shrink-0">
          <div className="max-h-[calc(100vh-1.5rem)] overflow-y-auto">
            <QuestionnairePanel applicantId={Number(applicantId)} partId={applicant.partId} />
          </div>
        </aside>
      </main>
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
    <Suspense fallback={<PageLayout.Content className="self-start py-7!" maxWidth="full" />}>
      <QuestionnairePage />
    </Suspense>
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
