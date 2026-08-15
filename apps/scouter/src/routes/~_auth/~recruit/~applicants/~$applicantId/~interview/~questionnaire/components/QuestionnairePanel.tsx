import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query';

import { assignedQuestionsOption } from '@/apis/interviews/questions/query';
import { interviewRequirementsOption } from '@/apis/interviews/requirements/query';
import { activeMembersOption } from '@/apis/members/query';
import { semestersNowOption } from '@/apis/semesters/query';
import { QuestionnaireEditor } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/QuestionnaireEditor';
import { RequirementsEditor } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/RequirementsEditor';
import { formatRecruitingSemester } from '@/utils/semester';

interface QuestionnairePanelProps {
  applicantId: number;
  partId: number;
}

export const QuestionnairePanel = ({ applicantId, partId }: QuestionnairePanelProps) => {
  /**
   * BUG: 항상 현재 학기를 써서, 과거 학기 지원자를 열면 그 학기가 아닌 현재 학기의
   * 요구조건·질문지가 보여요. `~eval/~interview/components/InterviewRubricSetting`은 같은 문제를
   * `inferRecruitingSemesterFromApplicationDate`(`@/utils/semester`)로 풀었으니, 여기도
   * `applicant.applicationDate` 기반으로 바꾸는 걸 고려해 주세요.
   */
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
    >
      {({ usedRequirementIds }) => (
        <RequirementsEditor
          partId={partId}
          requirements={requirements}
          semester={semester}
          usedRequirementIds={usedRequirementIds}
        />
      )}
    </QuestionnaireEditor>
  );
};
