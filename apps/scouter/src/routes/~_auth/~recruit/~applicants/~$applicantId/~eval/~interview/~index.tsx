import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Divider } from '@yourssu-inhouse/interior';
import { Suspense, useState } from 'react';
import { SwitchCase } from 'react-simplikit';

import type { ApplicantStateType } from '@/apis/applicants/schema';
import type { AssignedQuestions } from '@/apis/interviews/questions/schema';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import {
  interviewEvaluatorStatusesOption,
  myInterviewEvaluationOption,
} from '@/apis/interviews/evaluations/query';
import { interviewMemosOption } from '@/apis/interviews/memos/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { meOption } from '@/apis/members/query';
import { partsOption } from '@/apis/parts/query';
import { Paper } from '@/components/Paper';
import { InterviewQuestionContent } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewContent/InterviewQuestionContent';
import { InterviewScriptContent } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewContent/InterviewScriptContent';
import { InterviewMemoByQuestion } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewMemoByQuestion';
import { InterviewTab } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab';
import { DocumentAnswerForInterview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/DocumentAnswerForInterview';
import { InterviewQuestionList } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/InterviewQuestionList';
import {
  FIXED_SCRIPTS,
  INTRO_SCRIPT,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/introScript';
import { MyInterviewEvaluationPanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/MyInterviewEvaluationPanel';
import { OtherInterviewEvaluationsPanel } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/OtherInterviewEvaluationsPanel';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/components/ApplicantPageHeader';

const INTERVIEW_TABS = ['질문', '지원서'] as const;

interface InterviewEvaluationSubmissionAvailabilityParams {
  applicantState: ApplicantStateType;
  hasAssignment: boolean;
}

type InterviewEvaluationSubmissionAvailability =
  | { isSubmissionDisabled: false; submissionDisabledReason?: never }
  | { isSubmissionDisabled: true; submissionDisabledReason: string };

const RouteComponent = () => {
  const { applicantId } = Route.useParams();
  const [{ data: applicant }, { data: assignedQuestions }, { data: parts }] = useSuspenseQueries({
    queries: [
      applicantByIdOption(Number(applicantId)),
      {
        ...assignedQuestionsOption(Number(applicantId)),
        select: (data: AssignedQuestions) =>
          data.questions.filter((question) => {
            const isNonCultureFitQuestion = question.category !== 'CULTURE';
            const isSelectedCultureFitQuestion =
              question.category === 'CULTURE' && question.isSelected === true;
            return isNonCultureFitQuestion || isSelectedCultureFitQuestion;
          }),
      },
      partsOption(),
    ],
  });

  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(INTRO_SCRIPT.id);

  const selectedQuestion = assignedQuestions.find(({ id }) => id === selectedQuestionId);
  const selectedScript = FIXED_SCRIPTS[selectedQuestionId] ?? null;
  const panelState = selectedScript == null ? '질문' : '스크립트';
  const hasAssignment = parts.some(
    (part) => part.partId === applicant.partId && part.hasAssignment,
  );
  const submissionAvailability = getInterviewEvaluationSubmissionAvailability({
    applicantState: applicant.state,
    hasAssignment,
  });

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="면접 평가" />

      <main className="flex min-h-0 flex-[1_1_0] items-start gap-4 pt-7">
        <InterviewTab className="min-h-0 w-fit self-stretch" tabs={INTERVIEW_TABS}>
          {({ tab }) => (
            <Paper className="sticky top-3 h-full w-90 flex-1 scrollbar-gutter-stable overflow-y-auto p-0">
              <SwitchCase
                caseBy={{
                  질문: () => (
                    <InterviewQuestionList
                      onSelectQuestion={setSelectedQuestionId}
                      questions={assignedQuestions}
                      selectedQuestionId={selectedQuestionId}
                    />
                  ),
                  지원서: () => <DocumentAnswerForInterview applicantId={Number(applicantId)} />,
                }}
                value={tab}
              />
            </Paper>
          )}
        </InterviewTab>

        <Paper className="flex-1 flex-col p-0">
          <SwitchCase
            caseBy={{
              질문: () =>
                selectedQuestion != null ? (
                  <>
                    <InterviewQuestionContent question={selectedQuestion} />
                    {/* 면접관이 확정하지 않은 기본 미리보기 질문은 id가 없어요(OpenAPI 스펙 명시).*/}
                    {selectedQuestion.id != null && (
                      <InterviewMemoByQuestion
                        applicantId={Number(applicantId)}
                        sectionId={selectedQuestion.id}
                      />
                    )}
                  </>
                ) : null,
              스크립트: () => <InterviewScriptContent selectedScript={selectedScript} />,
            }}
            value={panelState}
          />
        </Paper>

        <Paper className="flex w-100 shrink-0 flex-col overflow-hidden p-0">
          <aside aria-label="내 면접 평가" className="w-full p-4">
            <Suspense>
              <MyInterviewEvaluationPanel
                applicantId={Number(applicantId)}
                partId={applicant.partId}
                semester={applicant.applicationSemester}
                {...submissionAvailability}
              />
            </Suspense>
          </aside>
          {!submissionAvailability.isSubmissionDisabled && (
            <>
              <Divider />
              <aside aria-label="다른 평가자 평가" className="w-full p-4">
                <OtherInterviewEvaluationsPanel
                  applicantId={Number(applicantId)}
                  applicantName={applicant.name}
                  applicantState={applicant.state}
                  interviewAverageScore={applicant.interviewAverageScore}
                />
              </aside>
            </>
          )}
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
    context.queryClient.prefetchQuery(assignedQuestionsOption(applicantId));
    context.queryClient.prefetchQuery(interviewMemosOption(applicantId));
    context.queryClient.prefetchQuery(interviewEvaluatorStatusesOption(applicantId));
    context.queryClient.prefetchQuery(meOption());
  },
});

const getInterviewEvaluationSubmissionAvailability = ({
  applicantState,
  hasAssignment,
}: InterviewEvaluationSubmissionAvailabilityParams): InterviewEvaluationSubmissionAvailability => {
  if (applicantState === 'UNDER_REVIEW') {
    return {
      isSubmissionDisabled: true,
      submissionDisabledReason: '서류 최종 합격/불합격 결정 후 면접 평가를 제출할 수 있어요.',
    };
  }

  if (hasAssignment && applicantState === 'DOCUMENT_ACCEPTED') {
    return {
      isSubmissionDisabled: true,
      submissionDisabledReason: '과제 최종 합격/불합격 결정 후 면접 평가를 제출할 수 있어요.',
    };
  }

  return { isSubmissionDisabled: false };
};
