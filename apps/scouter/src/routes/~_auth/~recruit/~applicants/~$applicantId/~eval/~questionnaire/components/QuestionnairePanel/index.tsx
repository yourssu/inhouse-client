import { useSuspenseQueries } from '@tanstack/react-query';

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
  const [{ data: assignedQuestions }, { data: requirements }, { data: activeMembersResponse }] =
    useSuspenseQueries({
      queries: [
        assignedQuestionsOption(applicantId),
        interviewRequirementsOption({ partId, semester }),
        activeMembersOption({ partId }),
      ],
    });

  return (
    <QuestionnaireEditor
      activeMembers={activeMembersResponse.members}
      applicantId={applicantId}
      assignedQuestions={assignedQuestions}
      requirements={requirements}
    />
  );
};
