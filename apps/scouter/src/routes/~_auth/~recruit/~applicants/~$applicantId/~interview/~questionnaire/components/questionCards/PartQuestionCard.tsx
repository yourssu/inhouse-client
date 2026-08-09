import type { Control } from 'react-hook-form';

import { IconButton } from '@yourssu-inhouse/interior';
import { MdDeleteOutline } from 'react-icons/md';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';
import type { ActiveMemberType } from '@/apis/members/schema';
import type { QuestionnaireFormValues } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionnaireForm';

import { EditableQuestionFields } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/EditableQuestionFields';
import { InterviewerField } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/InterviewerField';
import { QuestionCardFrame } from '@/routes/~_auth/~recruit/~applicants/~$applicantId/~interview/~questionnaire/components/questionCards/QuestionCardFrame';

interface PartQuestionCardProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  index: number;
  onDelete: () => Promise<void>;
  requirements: InterviewRequirements;
}

export const PartQuestionCard = ({
  activeMembers,
  control,
  index,
  onDelete,
  requirements,
}: PartQuestionCardProps) => {
  return (
    <QuestionCardFrame>
      <EditableQuestionFields
        category="PART"
        control={control}
        deleteButton={
          <IconButton
            aria-label="파트 공통 질문 삭제"
            onClick={onDelete}
            size="xs"
            tooltipContent="질문 삭제"
            type="button"
          >
            <MdDeleteOutline aria-hidden className="size-4" />
          </IconButton>
        }
        index={index}
        requirements={requirements}
      />

      <InterviewerField
        activeMembers={activeMembers}
        control={control}
        name={`PART.${index}.assignedInterviewerUserId`}
      />
    </QuestionCardFrame>
  );
};
