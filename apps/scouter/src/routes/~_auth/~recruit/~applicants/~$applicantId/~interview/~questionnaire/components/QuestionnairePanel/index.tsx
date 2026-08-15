import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { activeMembersOption } from '@/apis/members/query';
import { semestersNowOption } from '@/apis/semesters/query';
import { formatRecruitingSemester } from '@/utils/semester';

import { QuestionnaireEditor } from './QuestionnaireEditor';

interface QuestionnairePanelProps {
  applicantId: number;
  partId: number;
}

export const QuestionnairePanel = ({ applicantId, partId }: QuestionnairePanelProps) => {
  const { data: currentSemester } = useSuspenseQuery(semestersNowOption());
  const semester = formatRecruitingSemester(currentSemester);
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
