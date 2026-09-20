import { useSuspenseQueries } from '@tanstack/react-query';

import type {
  InterviewEvaluatorStatuses,
  MyInterviewEvaluation,
} from '@/apis/interviews/evaluations/schema';

import {
  interviewEvaluatorStatusesOption,
  myInterviewEvaluationOption,
} from '@/apis/interviews/evaluations/query';
import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { interviewRubricOption } from '@/apis/interviews/rubrics/query';
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
    { data: myEvaluation },
    { data: rubric },
  ] = useSuspenseQueries({
    queries: [
      assignedQuestionsOption(applicantId),
      interviewRequirementsOption({ partId, semester }),
      activeMembersOption({ partId }),
      interviewEvaluatorStatusesOption(applicantId),
      myInterviewEvaluationOption(applicantId),
      interviewRubricOption({ partId, semester }),
    ],
  });

  const isQuestionnaireDisabled = isQuestionnaireLocked({ evaluatorStatuses, myEvaluation });

  return (
    <QuestionnaireEditor
      activeMembers={activeMembersResponse.members}
      applicantId={applicantId}
      assignedQuestions={assignedQuestions}
      isQuestionnaireDisabled={isQuestionnaireDisabled}
      isSharedQuestionDisabled={rubric.isLocked}
      requirements={requirements}
    />
  );
};

interface IsQuestionnaireLockedParams {
  evaluatorStatuses: InterviewEvaluatorStatuses;
  myEvaluation: MyInterviewEvaluation;
}

const isQuestionnaireLocked = ({ evaluatorStatuses, myEvaluation }: IsQuestionnaireLockedParams) =>
  myEvaluation.submittedAt != null ||
  evaluatorStatuses.some(({ status }) => status === 'SUBMITTED');
