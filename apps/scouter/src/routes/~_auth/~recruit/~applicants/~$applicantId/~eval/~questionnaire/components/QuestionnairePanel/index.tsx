import { useSuspenseQueries } from '@tanstack/react-query';

import { interviewEvaluatorStatusesOption } from '@/apis/interviews/evaluations/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { activeMembersOption } from '@/apis/members/query';
import { QuestionnaireEditor } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~eval/~questionnaire/components/QuestionnairePanel/QuestionnaireEditor';

interface QuestionnairePanelProps {
  applicantId: number;
  partId: number;
  semester: string;
}

export const QuestionnairePanel = ({ applicantId, partId, semester }: QuestionnairePanelProps) => {
  const [
    { data: assignedQuestions },
    { data: requirements },
    { data: activeMembersResponse },
    { data: evaluatorStatuses },
  ] = useSuspenseQueries({
    queries: [
      assignedQuestionsOption(applicantId),
      interviewRequirementsOption({ partId, semester }),
      activeMembersOption({ partId }),
      interviewEvaluatorStatusesOption(applicantId),
    ],
  });

  /* 평가자 중 한 명이라도 제출 상태라면 질문지 편집을 막는다. */
  const isQuestionnaireDisabled = evaluatorStatuses.some(({ status }) => status === 'SUBMITTED');

  return (
    <QuestionnaireEditor
      activeMembers={activeMembersResponse.members}
      applicantId={applicantId}
      assignedQuestions={assignedQuestions}
      isQuestionnaireDisabled={isQuestionnaireDisabled}
      requirements={requirements}
    />
  );
};
