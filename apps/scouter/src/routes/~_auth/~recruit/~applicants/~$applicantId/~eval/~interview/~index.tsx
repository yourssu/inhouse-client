import { useSuspenseQueries } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { PageLayout } from '@yourssu-inhouse/exterior/layout';
import { Suspense, useState } from 'react';
import { SwitchCase } from 'react-simplikit';

import type { AssignedQuestions } from '@/apis/interviews/questions/schema';

import { applicantByIdOption, applicantDocumentAnswersOption } from '@/apis/applicants/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { Paper } from '@/components/Paper';
import { InterviewTab } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab';
import { DocumentAnswerForInterview } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/DocumentAnswerForInterview';
import { InterviewQuestionList } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/InterviewQuestionList';
import {
  FIXED_SCRIPTS,
  INTRO_SCRIPT_ID,
} from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~interview/components/InterviewTab/introScript';
import { ApplicantPageHeader } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/components/ApplicantPageHeader';

const INTERVIEW_TABS = ['질문 리스트', '지원서'] as const;

const RouteComponent = () => {
  const { applicantId } = Route.useParams();
  const [{ data: applicant }, { data: assignedQuestions }] = useSuspenseQueries({
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
    ],
  });

  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(INTRO_SCRIPT_ID);

  const selectedQuestion = assignedQuestions.find(({ id }) => id === selectedQuestionId);

  const selectedScript = FIXED_SCRIPTS[selectedQuestionId] ?? null;
  const panelState = selectedScript == null ? '질문' : '스크립트';

  return (
    <PageLayout.Content className="py-7!" maxWidth="full">
      <ApplicantPageHeader applicant={applicant} label="면접 평가" />

      <main className="flex min-h-0 flex-[1_1_0] items-start gap-4 pt-7">
        <InterviewTab className="min-h-0 w-fit self-stretch" tabs={INTERVIEW_TABS}>
          {({ tab }) => (
            <Paper className="sticky top-3 h-full w-90 flex-1 scrollbar-gutter-stable overflow-y-auto p-0">
              <SwitchCase
                caseBy={{
                  '질문 리스트': () => (
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

        <Paper className="flex-1 flex-col gap-4">
          {/* SwitchCase와 그 안의 요소는 다음 브랜치에서 작업해요. 현재는 결과를 보여주기 위해 AI 생성 코드를 두었어요.*/}
          <SwitchCase
            caseBy={{
              질문: () =>
                selectedQuestion ? (
                  <div className="flex flex-col gap-2">
                    <div className="text-neutralMuted text-13">{selectedQuestion.category}</div>
                    <div className="text-16 font-semibold">{selectedQuestion.content}</div>
                    <div>질문자 {selectedQuestion.assignedInterviewerName}</div>
                    <ul className="flex flex-col gap-1">
                      {selectedQuestion.requirements.map((requirement) => (
                        <li key={requirement.id}>{requirement.content}</li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              스크립트: () =>
                selectedScript ? (
                  <div className="flex flex-col gap-3">
                    <div className="text-16 font-semibold">{selectedScript.title}</div>
                  </div>
                ) : null,
            }}
            value={panelState}
          />
        </Paper>

        <Paper className="w-100 shrink-0">사이드바</Paper>
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
    context.queryClient.prefetchQuery(applicantDocumentAnswersOption(applicantId));
    context.queryClient.prefetchQuery(assignedQuestionsOption(applicantId));
  },
});
