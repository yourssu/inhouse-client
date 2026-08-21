import type { Control } from 'react-hook-form';

import { IconButton } from '@yourssu-inhouse/interior';
import { MdDeleteOutline } from 'react-icons/md';

import type { InterviewRequirements } from '@/apis/interviews/requirements/schema';
import type { ActiveMemberType } from '@/apis/members/schema';

import type { QuestionnaireFormValues } from '../questionnaireForm';

import { EditableQuestionFields } from './EditableQuestionFields';
import { InterviewerField } from './InterviewerField';
import { QuestionCardFrame } from './QuestionCardFrame';

interface PersonalQuestionCardProps {
  activeMembers: ActiveMemberType[];
  control: Control<QuestionnaireFormValues>;
  index: number;
  onDelete: () => Promise<void>;
  requirements: InterviewRequirements;
}

export const PersonalQuestionCard = ({
  activeMembers,
  control,
  index,
  onDelete,
  requirements,
}: PersonalQuestionCardProps) => {
  return (
    <QuestionCardFrame>
      <EditableQuestionFields
        category="PERSONAL"
        control={control}
        deleteButton={
          <IconButton
            aria-label="개인 질문 삭제"
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
        name={`PERSONAL.${index}.assignedInterviewerUserId`}
      />
    </QuestionCardFrame>
  );
};
